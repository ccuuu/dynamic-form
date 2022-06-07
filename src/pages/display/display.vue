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
import copyEventMixin from '../../mixins/copy-event.mixin'
import selectEventMixin from '../../mixins/select-event.mixin'
import deformationEventMixin from '../../mixins/deformation-event.mixin'
import contextmenuMixin from '../../mixins/contextmenu.mixin'

import { cache, cloneDeep } from '../../utils'
import { MoveCaseEnum } from '../../utils/Enum'
import { FormType } from '../../utils/Enum'
import { Constraints, rewriteCore } from '../../factory/create-constraints'

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
  data() {
    return {
      waitingMacroTaskTimer: null,
      waitingMacroTask: false,
      elementInfo: null,
      draggableSection: null,
      constraints: [],
      moveCase: null,
      formatObserveContain: null,
    }
  },
  props: {
    form: {
      type: Object,
      required: true,
    },
  },
  created() {
    this.rewriteArrayMethods.fn = 'abc'
    this.rewriteArrayMethods(this.constraints)
    this.newRowHandler()
    this.registerEvent()
  },
  mounted() {
    this.draggableSection = this.$refs.draggableSection

    document.body.addEventListener('mousedown', this.mousedownEvent)
    document.body.addEventListener('mouseup', this.mouseupEvent)
    this.draggableSection.addEventListener('contextmenu', this.contextmenuEvent)
  },
  watch: {
    moveCase(val) {
      if (val === MoveCaseEnum.DeformationEvent) {
        //在deformation行进中的copy事件
        this.mousemoveEvent.fn = (e) => {
          this.resolveCopyInMoveEvent(e)
          this.deformationEvent(e)
        }
      } else if (val === MoveCaseEnum.CopyEvent) {
        this.mousemoveEvent.fn = this.copyEvent
      } else if (val === MoveCaseEnum.SelectEvent) {
        this.mousemoveEvent.fn = this.selectEvent
      } else {
        this.mousemoveEvent.fn = null
      }
    },
  },
  methods: {
    //将一个非observe的任意引用类型变量变成observe对象
    formatObserve(item) {
      Promise.resolve().then(() => (this.formatObserveContain = null))
      return (this.formatObserveContain = item)
    },
    rewriteArrayMethods(arr) {
      if (!Array.isArray(arr)) return
      const origin = arr.__proto__

      const constraintsProto = Object.create(origin),
        constraintsItemProto = Object.create(origin)

      rewriteCore(constraintsProto, constraintsItemProto)

      arr.__proto__ = constraintsProto
      constraintsProto.constructor = Constraints
    },
    genColItem(columns = 24) {
      return { columns }
    },
    isEventInSection(e) {
      return (e.path || []).some((item) => item === this.draggableSection)
    },
    mousedownEvent(e) {
      //"暂时性死区"。当未完成位置信息计算的时候不允许点击
      if (this.waitingMacroTask) return
      if (this.isEventInSection(e)) {
        e.preventDefault()
      }
      //不在区域内，点击任意键都清除select
      if (
        !Array.from(e.path).some(
          (ele) => ele instanceof HTMLElement && ele.tagName === 'CANVAS'
        )
      )
        this.resolveSelectInDownEvent()
      if (e.button !== 0) return
      //点击左键，无论鼠标位置，固定清除select
      this.resolveSelectInDownEvent()

      document.addEventListener('mousemove', this.mousemoveEvent)

      let target
      if (
        !(target =
          this.findElementContainer(e.pageX, e.pageY) &&
          this.findElementContainer(e.pageX, e.pageY).dom.el)
      )
        return

      this.toggleDomClickStyle(target, true /*set style*/)

      this.resolveCopyInDownEvent(target, e)

      this.resolveDeformInDownEvent(target, e)
    },
    mousemoveEvent(e) {
      if (e.button !== 0) return
      //处理事件类型
      this.resolveEvent(e)

      //event
      //在 moveCase的watch中赋值
      this.mousemoveEvent.fn && this.mousemoveEvent.fn(e)
    },
    mouseupEvent(e) {
      if (e.button !== 0) return
      this.moveCase = null
      document.removeEventListener('mousemove', this.mousemoveEvent)

      this.finishEvent(e)
    },
    resolveEvent(e) {
      if (
        !this.moveCase &&
        this.currentDeformElement &&
        !this.currentDeformElement.isSingle
      )
        this.moveCase = MoveCaseEnum.DeformationEvent

      if (
        (!this.moveCase || this.moveCase === MoveCaseEnum.DeformationEvent) &&
        this.currentCopiedElement
      )
        this.moveCase = MoveCaseEnum.CopyEvent

      if (
        Math.abs(e.movementY) > 5 &&
        (!this.moveCase || this.moveCase === MoveCaseEnum.DeformationEvent)
      ) {
        this.moveCase = MoveCaseEnum.SelectEvent
        this.initSelectEvent(this.elementInfo)

        this.clearCopyTimer()
        this.finishEvent(e)
      }
    },
    finishEvent(e, keepCurrentEle) {
      this.clearCopyTimer()

      //基于事件的依赖属性结束事件，而非moveCase。因为在某些时候需要在一种moveCase
      //的时候手动finish另一项事件
      if (this.currentCopiedElement) {
        return this.finishCopy(e)
      }

      if (this.selectElement.length) {
        return this.finishSelect()
      }

      if (this.currentDeformElement) {
        this.finishDeformation(e, keepCurrentEle)
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
      dom.style.backgroundColor = '#d8e3ffbd'
      dom.style.transition = 'background 0.25s'
    },
    deleteRowHandler(begin, end = begin) {
      this.constraints.splice(begin, end - begin + 1)
      this.waitingMacroTaskHook()
    },
    newColHandler(index = 0) {
      const row = this.constraints[index]
      const columns = row[row.length - 1].columns

      const total = row.reduce((res, item) => res + item.columns, 0)
      if (total < 24) {
        return row.push(this.genColItem(24 - total))
      }

      if (columns < 2) return
      row[row.length - 1].columns = Math.ceil(columns / 2)
      row.push(this.genColItem(Math.floor(columns / 2)))
      //Force update current row
      this.forceUpdateRow(row)
    },
    formatNewRowArgs(args) {
      let index = Number.isSafeInteger(args[0]) ? args[0] : 0,
        noTransition = !Number.isSafeInteger(args[args.length - 1])
          ? args[args.length - 1]
          : false,
        startIndex = Number.isSafeInteger(args[1]) ? args[1] : null,
        endIndex = Number.isSafeInteger(args[2]) ? args[2] : startIndex
      return { index, startIndex, endIndex, noTransition }
    },
    newRowHandler(...args) {
      const {
        index,
        startIndex,
        endIndex,
        noTransition,
      } = this.formatNewRowArgs(args)

      let rows = this.formatObserve([])
      if (!Number.isSafeInteger(startIndex)) {
        rows.push([this.genColItem()])
      } else {
        for (let i = startIndex; i <= endIndex; i++) {
          rows.push(cloneDeep(this.constraints[i]))
        }
      }

      if (noTransition) {
        this.defineNoTransitionRows(rows)
      } else {
        this.waitingMacroTaskHook()
      }
      this.constraints.splice(index + 1, 0, rows)
      //Force update of all items after this row
      for (let i = index + 1, l = this.constraints.length; i < l; i++) {
        this.forceUpdateRow(this.constraints[i])
      }
      return rows
    },
    defineNoTransitionRows(rows = []) {
      const _this = this
      rows.forEach((row) => {
        console.log('defineNoTransitionRows', row)

        row &&
          Object.defineProperty(row, 'noTransition', {
            configurable: true,
            enumerable: false,
            get() {
              //Micro task cannot be used here,because it will cause repeated renders in a task queue
              //Implicit removal of this property must wait until the dom update is complete

              //看起来似乎新增的DOM会在下一帧再执行css中的过度，而不是创建之初就应用。
              //因为删除时机只有在requestAnimationFrame中能够使dom挂载上动画效果，
              //而任何立即执行的微任务或宏任务都无法实现

              //如果仅在dom创建的时机就删除noTransition，会导致执行的动画效果仍然应
              //用vue的过渡动画
              if (!_this.draggableSection) return
              const observer = new MutationObserver((e) => {
                if (!e.some(includeAnimation)) return

                function includeAnimation(item) {
                  return item.oldValue.includes('list-complete-enter')
                }
                requestAnimationFrame(() => _this.$delete(this, 'noTransition'))
                observer.disconnect()
              })
              observer.observe(_this.draggableSection, {
                subtree: true,
                attributes: true,
                attributeOldValue: true,
                attributeFilter: ['class'],
              })
              return true
            },
          })
      })
    },
    waitingMacroTaskHook() {
      this.waitingMacroTask = true
      if (this.waitingMacroTaskTimer) {
        clearTimeout(this.waitingMacroTaskTimer)
      }
      //Refresh the information after waiting for the animation to complete

      //chrome的timeout精准度为4ms，DOM完成动画的时间为300ms,但是看起来似乎当
      //多个动画项叠加在一起的时候会存在时延(或许是vue animation所导致的)，从而
      //导致304并不能获取到最终正确的dom的元素信息。并且在页面卡顿的时候，该延迟
      //会不确定的增加
      //此时，并不确定所操作项的数量或页面是否卡顿，因此，妥协措施是使用一个较大的
      //timeout。但是这种方案实在太蠢了，需要优化...

      this.waitingMacroTaskTimer = setTimeout(() => {
        requestAnimationFrame(() => (this.waitingMacroTask = false))
      }, 354)
    },
    forceUpdateRow(row) {
      row.forEach((col) => col.forceUpdate++)
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
      //拖动事件无法通过path判断是否在section，只能通过position
      if (!this.form.formType || !this.eventNotInSection(e)) return
      const target = this.findElementContainer(e.pageX, e.pageY)
      if (!target) return
      if (
        (target.formType === FormType.Radio &&
          this.form.formType === FormType.Radio) ||
        (target.formType === FormType.Checkbox &&
          this.form.formType === FormType.Checkbox)
      ) {
        this.optionKeyFormat(target.options, this.form.formInfo.options)
        target.options.push(...this.form.formInfo.options)
      } else {
        for (const [key, item] of Object.entries(this.form.formInfo)) {
          this.$set(target, key, item)
        }
      }
    },
    optionKeyFormat(oldOptions, newOptions ) {
      if(!newOptions || !newOptions.length) return 
      let maxIdx = 0
      const { length } = oldOptions
      const reg = /^default_/

      for (let i = 0; i < length; i++) {
        const item = oldOptions[i].value
        let n
        if (
          reg.test(item) &&
          (n = Number(item.replace(reg, ''))) &&
          Number.isSafeInteger(n)
        ) {
          maxIdx = Math.max(maxIdx, n)
        }
      }

      newOptions.forEach((item) => {
        if (reg.test(item.value)) {
          item.value = `default_${++maxIdx}`
        }
      })
    },
    findElementContainer(x, y) {
      const stack = [this.constraints]
      while (stack.length) {
        const item = stack.pop()
        if (Array.isArray(item)) {
          stack.push(...item)
          continue
        }
        const { left, right, top, bottom } = (item.dom && item.dom.range) || {}
        if (left <= x && right >= x && top <= y && bottom >= y) {
          return item
        }
      }
      return null
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
    registerEvent(){
      this.$eventEmitter.on('addElement',this.addElement)
    },
    removeRegister(){
      this.$eventEmitter.off('addElement')
    },
    removeEventListener(){
      document.body.removeEventListener('mousedown', this.mousedownEvent)
      document.body.removeEventListener('mouseup', this.mouseupEvent)
      this.draggableSection.removeEventListener(
        'contextmenu',
        this.contextmenuEvent
      )
    }
  },
  updated() {
    //When change the cols width，refreshConstraintsDom should be called sync
    //when add or delete the row, refreshConstraintsDom should be called after the animation finish
    !this.waitingMacroTask && this.refreshConstraintsDom()
  },
  beforeDestroy() {
    this.removeEventListener()
    this.removeRegister()
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
    background-color: #d8e3ff;
  }
  100% {
    transform: scale(1, 1);
  }
}
.box-card {
  -webkit-backdrop-filter: blur(12px);
  background-color: transparent !important;
  backdrop-filter: blur(6px);
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgb(109 140 193 / 63%) !important;
}
</style>
