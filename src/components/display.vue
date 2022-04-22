<template>
  <!-- waitingMacroTask not a real prop, just for trigger updated hook -->
  <el-card class="box-card" :waitingMacroTask="waitingMacroTask">
    <template #header class="clearfix">
      <span>Dynamic Form</span>
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
              :constraints="constraints"
              @newColHandler="newColHandler"
              @newRowHandler="newRowHandler"
              @deleteRowHandler="deleteRowHandler"
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

import { cache } from '../utils'
import { MoveCaseEnum } from '../utils/Enum'

export default {
  mixins: [copyEventMixin, selectEventMixin],
  components: {
    DisplayDynamicForm,
  },
  data() {
    return {
      timer: null,
      updateTimer: null,
      waitingMacroTask: false,
      elementInfo: null,
      draggableSection: null,
      currentDeformElement: null,
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
  watch: {
    currentDeformElement(val) {
      if (val) {
        const changeInLeftSideEle = eval(
          val.getAttribute('data-change-left-element')
        )
        const originX = val.getAttribute('data-origin-x') - 0
        const originWidth = val.getAttribute('data-origin-width') - 0

        val.removeAttribute('data-change-left-element')
        val.removeAttribute('data-origin-x')
        val.removeAttribute('data-origin-width')
        this.elementInfo = {
          changeInLeftSideEle,
          originWidth,
          originX,
          position: this.findPagePosition(val),
        }
        const sibling = this.findSingleChildrenByClass(
          this.findParentByClass(val, 'el-col')[
            changeInLeftSideEle ? 'previousSibling' : 'nextSibling'
          ],
          'context-box'
        )
        this.elementInfo.siblingInfo = {
          el: sibling,
          originWidth: sibling.offsetWidth,
        }

        document.body.addEventListener('mousemove', this.mousemoveEvent)
      } else {
        document.body.removeEventListener('mousemove', this.mousemoveEvent)
        this.elementInfo = null
      }
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

          if (!formatArgs.hasOwnProperty('key')) {
            //single params
            if (!Array.isArray(formatArgs[0])) {
              formatArgs.key = Math.random() + ''
            } else {
              return (method === 'splice'
                ? formatArgs.reverse()
                : formatArgs
              ).every((i) => {
                i.key = Math.random() + ''
                return defineAndCallMethod(i)
              })
            }
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
      let target = e.target
      target = this.findParentByClass(target, 'context-box')
      if (!target) return
      this.toggleDomClickStyle(target, true /*set style*/)
      this.isCopyEvent(
        function() {
          this.toggleDomClickStyle(target, false /*remove style*/)
          this.mouseupEvent(
            e,
            true /*keep current element until delete manually */
          )
          return target
        }.bind(this)
      )
      if (this.findSiblingLength(target) === 1) return
      const { left, right } = this.findPagePosition(target)
      target.setAttribute(
        'data-change-left-element',
        (e.pageX < (left + right) / 2 && !this.isLineFirstEle(target)) ||
          this.isLineLastEle(target)
      )
      this.currentDeformElement = target

      this.currentDeformElement.setAttribute('data-origin-x', e.pageX)
      this.currentDeformElement.setAttribute(
        'data-origin-width',
        this.currentDeformElement.offsetWidth
      )
    },
    mouseupEvent(e, keepCurrentEle) {
      if (e.button !== 0) return
      this.moveCase = null
      this.clearTimer()
      if (this.currentCopiedElement) {
        this.finishCopy(e)
        return
      } else if (Number.isSafeInteger(this.beginRowIndex)) {
        this.finishSelect()
      } else {
        this.finishDeformation(e, keepCurrentEle)
      }
    },
    finishDeformation(e, keepCurrentEle) {
      const target =
        this.findParentByClass(e.target, 'context-box') ||
        this.currentDeformElement
      if (!target) return
      this.toggleDomClickStyle(target, false /*remove style*/)
      if (!this.currentDeformElement) return
      this.refreshCurrentRow(this.currentDeformElement)
      //for copyElement
      if (keepCurrentEle) return
      this.currentDeformElement = null
    },
    clearTimer() {
      clearTimeout(this.timer)
      this.timer = null
    },
    isLineFirstEle(target) {
      return this.findParentByClass(target, 'el-col').isEqualNode(
        this.findParentByClass(target, 'el-row').firstChild
      )
    },
    isLineLastEle(target) {
      return this.findParentByClass(target, 'el-col').isEqualNode(
        this.findParentByClass(target, 'el-row').lastChild
      )
    },
    findSiblingLength(target) {
      const stack = [this.constraints]
      while (stack.length) {
        const item = stack.pop()
        if (Array.isArray(item)) {
          stack.push(...item)
          continue
        }
        if (item.dom.el.isEqualNode(target)) return item.dom.siblingNumber
      }
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
      dom.style.backgroundColor = '#ebeef5'
    },
    deleteRowHandler(index) {
      this.constraints.splice(index, 1)
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
      row.key = Math.random()
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
        this.waitingMacroTask = true
        this.updateTimer && clearTimeout(this.updateTimer)
        this.updateTimer = setTimeout(() => {
          this.waitingMacroTask = false
        }, 304)
      }
      this.constraints.splice(index + 1, 0, row)
      //Force update of all items after this row
      for (let i = index + 1, l = this.constraints.length; i < l; i++) {
        this.forceUpdateRow(this.constraints[i])
      }
    },
    forceUpdateRow(row) {
      row.forEach((col) => col.forceUpdate++)
    },
    mousemoveEvent(e) {
      if (e.button !== 0) return
      if (!this.moveCase) this.moveCase = MoveCaseEnum.Default

      //if mouse move, clear the copyEvent timer
      if (this.timer && (e.movementX || e.movementY)) this.clearTimer()
      this.isCopyEvent(
        function() {
          this.mouseupEvent(
            e,
            true /*keep current element until delete manually */
          )
        }.bind(this)
      )

      e.preventDefault()
      if (e.movementY > 5) {
        this.moveCase = MoveCaseEnum.SelectEvent
        this.clearTimer()
        this.finishDeformation(e)
      }
      if (this.moveCase === MoveCaseEnum.DeformationEvent) {
        this.deformationEvent(e)
      } else {
        this.isSelectEvent(this.elementInfo)
      }
    },
    deformationEvent(e) {
      const { currentDeformElement } = this
      if (!currentDeformElement) return
      const {
        siblingInfo,
        changeInLeftSideEle,
        originX,
        originWidth,
      } = this.elementInfo
      //to do : optimization the animation when item is too short
      if (
        Number.parseInt(siblingInfo.el.style.width) < 20 ||
        Number.parseInt(currentDeformElement.style.width) < 20
      )
        return

      if (changeInLeftSideEle) {
        currentDeformElement.style.width =
          originWidth + originX - e.pageX + 'px'
        currentDeformElement.style.position = 'relative'
        currentDeformElement.style.left = -originX + e.pageX + 'px'
        const sibling = siblingInfo.el
        sibling.style.width = siblingInfo.originWidth - originX + e.pageX + 'px'
      } else {
        currentDeformElement.style.width =
          originWidth - originX + e.pageX + 'px'
        siblingInfo.el.style.width =
          siblingInfo.originWidth + originX - e.pageX + 'px'
        siblingInfo.el.style.position = 'relative'
        siblingInfo.el.style.left = -originX + e.pageX + 'px'
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
      console.log(this.constraints[0][0].dom.range)
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
