<template>
  <!-- waitingMacroTask not a real prop, just for trigger updated hook -->
  <el-card class="box-card">
    <template #header class="clearfix">
      <span>Dynamic Form{{ waitingMacroTask }}</span>
    </template>
    <el-form ref="form" :model="form" label-position="top">
      <el-row type="flex">
        <el-col :span="23">
          <div
            ref="draggableSection"
            class="draggable-section"
            style="position: relative"
          >
            <display-dynamic-form
              :waitingMacroTask="waitingMacroTask"
              :constraints="constraints"
              @newColHandler="newColHandler"
              @newRowHandler="newRowHandler"
              @deleteRowHandler="deleteRowHandler"
              @macroTaskFinish="waitingMacroTask = false"
            ></display-dynamic-form>
          </div>
        </el-col>
      </el-row>
    </el-form>
    <el-button
      type="text"
      style="font-size:20px;padding:0;position: absolute;left: 50%;transform: translate(-50%, 8%);"
      ><i class="el-icon-d-arrow-left" style="transform: rotate(-90deg);"></i
    ></el-button>
  </el-card>
</template>
<script>
import DisplayDynamicForm from './display-dynamic-form.vue'
import copyEventMixin from '../mixins/copy-event.mixin'
import selectEventMixin from '../mixins/select-event.mixin'
import deformationEventMixin from '../mixins/deformation-event.mixin'
import contextmenuMixin from '../mixins/contextmenu.mixin'

import { cache } from '../utils'
import { MoveCaseEnum } from '../utils/Enum'

export default {
  mixins: [
    copyEventMixin,
    selectEventMixin,
    deformationEventMixin,
    contextmenuMixin,
  ],
  components: {
    DisplayDynamicForm,
  },
  watch: {
    waitingMacroTask(v) {
      console.log(v, 'waitingMacroTask')
    },
  },
  data() {
    return {
      waitingMacroTaskTimer: null,
      waitingMacroTask: false,
      elementInfo: null,
      draggableSection: null,
      constraints: [],
      moveCase: null,
    }
  },
  props: {
    form: {
      type: Object,
      required: true,
    },
  },

  mounted() {
    this.rewriteArrayMethods(this.constraints)

    this.draggableSection = this.$refs.draggableSection

    this.newRowHandler()

    document.body.addEventListener('mousedown', this.mousedownEvent)
    document.body.addEventListener('mouseup', this.mouseupEvent)
  },
  methods: {
    rewriteArrayMethods(arr) {
      if (!Array.isArray(arr)) return
      const origin = arr.__proto__

      function define(arr, key, methods) {
        Object.defineProperty(arr, key, {
          configurable: false,
          enumerable: false,
          writable: false,
          value: methods,
        })
        return methods
      }

      const constraintsProto = Object.create(origin),
        constraintsItemProto = Object.create(origin)

      ;['push', 'unshift', 'splice'].forEach((method) => {
        function formatParams(args, formatFn = (i) => i) {
          const basic = method === 'splice' ? args.slice(0, 2) : []
          args = method === 'splice' ? args.slice(2) : args
          args = formatFn(args)
          return {
            formatArgs: args.length === 1 ? args[0] : args,
            basic,
          }
        }

        const genForceUpdate = define(constraintsItemProto, method, function genForceUpdate(
          ...args
        ) {
          if (!args.length) return
          const { formatArgs, basic } = formatParams(args)
          ;(Array.isArray(formatArgs) ? formatArgs : [formatArgs]).forEach(
            (col) => (col.forceUpdate = col.forceUpdate || 1)
          )
          return origin[method].call(this, ...basic, formatArgs)
        })

        define(constraintsProto, method, function constrainsArrayMethod(
          ...args
        ) {
          const _this = this
          if (!args.length) return

          const { basic, formatArgs } = formatParams(args, function(args) {
            return args.map((i) => (!Array.isArray(i) ? [i] : i))
          })

          if (!formatArgs.length) return origin[method].call(this, ...basic)

          const buffer = new Uint32Array(1)
          //single params
          if (!Array.isArray(formatArgs[0])) {
            formatArgs.key = crypto.getRandomValues(buffer)[0] + ''
          } else {
            return (method === 'splice'
              ? formatArgs.reverse()
              : formatArgs
            ).every((i) => {
              i.key = crypto.getRandomValues(buffer)[0] + ''
              return defineAndCallMethod(i)
            })
          }

          function defineAndCallMethod(arrItem) {
            arrItem.__proto__ = constraintsItemProto
            return genForceUpdate.call(_this, ...basic, arrItem)
          }
          return defineAndCallMethod(formatArgs)
        })
      })
      arr.__proto__ = constraintsProto
    },
    genColItem(columns = 24) {
      return { columns }
    },
    mousedownEvent(e) {
      e.stopPropagation()
      e.preventDefault()
      if (e.button !== 0) return

      this.resolveSelectInDownEvent()

      let target = this.findParentByClass(e.target, 'context-box')
      if (!target) return

      this.toggleDomClickStyle(target, true /*set style*/)

      this.resolveCopyInDownEvent(target, e)

      this.resolveDeformInDownEvent(target, e)
    },
    mouseupEvent(e, keepCurrentEle) {
      if (e.button !== 0) return
      this.moveCase = null
      this.clearCopyTimer()
      if (this.currentCopiedElement) {
        this.finishCopy(e)
        return
      } else if (this.selectElement.length) {
        this.finishSelect()
      } else {
        this.finishDeformation(e, keepCurrentEle)
      }
    },

    clearMacroTaskTimer() {
      clearTimeout(this.waitingMacroTaskTimer)
      this.waitingMacroTaskTimer = null
    },

    findParentByClass(target, className) {
      while (target && !(target.className || '').includes(className))
        target = target.parentNode
      return target
    },
    toggleDomClickStyle(dom, isAdd) {
      if (!dom) return
      if (!isAdd) {
        dom.style.zIndex = ''
        dom.style.backgroundColor = ''
        return
      }
      dom.style.zIndex = '1000'
      dom.style.backgroundColor = '#EBEEF5'
    },
    deleteRowHandler(begin, end = begin) {
      this.constraints.splice(begin, end - begin + 1)
      this.waitingMacroTaskHook()
    },
    newColHandler(index = 0) {
      const row = this.constraints[index]
      const columns = row[row.length - 1].columns
      if (columns < 2) return
      row[row.length - 1].columns = Math.ceil(columns / 2)
      row.push(this.genColItem(Math.floor(columns / 2)))
      //Force update current row
      this.forceUpdateRow(row)
    },
    newRowHandler(index = 0, row = this.genColItem(), noTransition = false) {
      const _this = this
      if (noTransition) {
        Object.defineProperty(row, 'noTransition', {
          configurable: true,
          enumerable: false,
          get() {
            //Micro task cannot be used here,because it will cause repeated renders in a task queue
            //Implicit removal of this property must wait until the dom update is complete
            setTimeout(() => {
              _this.$delete(this, 'noTransition')
            }, 100)
            return true
          },
        })
      } else {
        this.waitingMacroTaskHook()
      }
      this.constraints.splice(index + 1, 0, row)
      //Force update of all items after this row
      for (let i = index + 1, l = this.constraints.length; i < l; i++) {
        this.forceUpdateRow(this.constraints[i])
      }
    },
    waitingMacroTaskHook() {
      this.waitingMacroTask = true
      // this.waitingMacroTaskTimer && this.clearMacroTaskTimer()
      // //Refresh the information after waiting for the animation to complete
      // this.waitingMacroTaskTimer = setTimeout(() => {
      //   this.waitingMacroTask = false
      // }, 400)
    },
    forceUpdateRow(row) {
      row.forEach((col) => col.forceUpdate++)
    },
    mousemoveEvent(e) {
      if (e.button !== 0) return
      if (!this.moveCase) this.moveCase = MoveCaseEnum.Default

      this.resolveCopyInMoveEvent(e)

      e.preventDefault()
      if (Math.abs(e.movementY) > 5) {
        this.moveCase = MoveCaseEnum.SelectEvent
        this.clearCopyTimer()
        this.finishDeformation(e)
      }
      if (this.moveCase === MoveCaseEnum.DeformationEvent) {
        this.deformationEvent(e)
      } else {
        this.initSelectEvent(this.elementInfo)
      }
    },

    refreshCurrentRow(ele) {
      const content = this.findParentByClass(ele, 'content')
      const itemRow = content.parentNode
      const itemCol = this.findParentByClass(ele, 'el-col')
      const colNeighbor = this.findSingleChildrenByClass(content, 'el-row')
        .childNodes
      let itemIndex = -1
      while (colNeighbor.item(++itemIndex) !== itemCol) continue
      const rowNeighbor = itemRow.parentNode.childNodes
      let rowIndex = -1
      while (rowNeighbor.item(++rowIndex) !== itemRow) continue
      const changeToColumns = Math.round(
        (ele.offsetWidth / itemRow.offsetWidth) * 24
      )
      const itemLine = this.constraints[rowIndex]
      const originColumns = itemLine[itemIndex].columns
      itemLine[itemIndex].columns = changeToColumns
      itemLine[
        !this.elementInfo.changeInLeftSideEle ? ++itemIndex : --itemIndex
      ].columns -= changeToColumns - originColumns
      this.forceUpdateRow(itemLine)
      //trigger current component update hook
      this.constraints.push({})
      this.constraints.pop()
    },
    addElement(e) {
      if (!this.form.formType || !this.eventNotInSection(e)) return
      const position = this.findElementContainer(e.pageX, e.pageY)
      for (const [key, item] of Object.entries(this.form)) {
        this.$set(position, key, item)
      }
    },
    findElementContainer(x, y) {
      const stack = [this.constraints]
      while (stack.length) {
        const item = stack.pop()
        if (Array.isArray(item)) {
          stack.push(...item)
          continue
        }
        const { left, right, top, bottom } = item.dom.range
        if (left <= x && right >= x && top <= y && bottom >= y) {
          return item
        }
      }
    },
    eventNotInSection(e) {
      const { left, right, top, bottom } = this.findPagePosition(
        this.draggableSection,
        false /*no use cache*/
      )

      const { pageX, pageY } = e
      if (left <= pageX && right >= pageX && top <= pageY && bottom >= pageY)
        return true
      return false
    },

    //this has refresh order bug and cache bug
    refreshConstraintsDom() {
      let rowParent = this.findSingleChildrenByClass(
        this.draggableSection,
        'el-row'
      ).parentNode
      this.constraints.forEach((row, rowIndex) => {
        const content = rowParent.childNodes.item(rowIndex).childNodes[0]
        const siblingNumber = content.querySelectorAll('.context-box').length
        const rowItem = this.findSingleChildrenByClass(content, 'el-row')
        row.forEach((item, itemIndex) => {
          const el = this.findSingleChildrenByClass(
            rowItem.childNodes.item(itemIndex),
            'context-box'
          )
          const { left, right, top, bottom } = this.findPagePosition(el)
          const setDom = {
            el: el,
            range: {
              left: Number.parseInt(left),
              right: Number.parseInt(right),
              top: Number.parseInt(top),
              bottom: Number.parseInt(bottom),
            },
            siblingNumber,
          }
          //should not use $set, it will lead to vue update
          item.dom = setDom
        })
      })
    },
    findSingleChildrenByClass(dom, className) {
      return dom && dom.querySelector(`.${className}`)
    },
    findPagePosition: cache(function(el) {
      let left = 0,
        top = 0,
        width = el.offsetWidth,
        height = el.offsetHeight
      while (el && el.offsetParent) {
        left += el.offsetLeft
        top += el.offsetTop
        el = el.offsetParent
      }
      return {
        left,
        top,
        right: left + width,
        bottom: top + height,
      }
    }),
  },
  updated() {
    //When change the cols width，refreshConstraintsDom should be called sync
    //when add or delete the row, refreshConstraintsDom should be called after the animation finish
    !this.waitingMacroTask && this.refreshConstraintsDom()
  },
}
</script>
<style>
@keyframes copy {
  0% {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(1.015, 1.1);
    opacity: 1;
    background-color: #dadee9;
  }
  100% {
    transform: scale(1, 1);
  }
}
</style>
