import { cache, cloneDeep } from '../utils'

export default {
  data() {
    return {
      currentCopiedElement: null,
      copyElement: null,
      placeholderElement: null,
      prePlaceholderElement: null,
      cacheCopyToIndex: null,
      placeHolderEleNumber: 0,
    }
  },
  watch: {
    currentCopiedElement(val) {
      if (val) {
        //copy from currentCopiedElement to copyElement
        this.copyAndInsertElement()
        document.body.addEventListener('mousemove', this.copyEvent)
      } else {
        document.body.removeEventListener('mousemove', this.copyEvent)
        this.copyElement = null
        this.placeholderElement = null

        this.prePlaceholderElement = null
      }
    },
    placeHolderEleNumber(val) {
      if (val === 0 && this.waitingMacroTask) {
        Promise.resolve().then(() => {
          this.refreshConstraintsDom()
          this.waitingMacroTask = false
        })
      }
    },
  },
  methods: {
    isCopyEvent(cb) {
      if (this.timer) return
      this.timer = setTimeout(() => {
        this.setAsCopyEvent(cb && cb())
      }, 650)
    },
    setAsCopyEvent(currentDeformElement) {
      this.currentCopiedElement = this.findParentByClass(
        currentDeformElement || this.currentDeformElement,
        'el-row'
      )
      this.currentDeformElement = null
      this.timer = null
    },
    copyAndInsertElement() {
      const { currentCopiedElement } = this
      const copy = currentCopiedElement.cloneNode(true)
      const { left, top } = this.findPagePosition(currentCopiedElement)
      //fix issue: form-item style lost
      const packageForm = this.findParentByClass(
        currentCopiedElement,
        'el-form'
      ).cloneNode()

      packageForm.appendChild(copy)

      packageForm.style.borderRadius = '10px'
      packageForm.style.backgroundColor = 'rgb(235, 238, 245)'
      packageForm.style.opacity = 0.7
      packageForm.style.width = currentCopiedElement.offsetWidth + 'px'
      packageForm.style.height = currentCopiedElement.offsetHeight + 'px'

      document.body.appendChild(packageForm)

      this.placeholderElement = packageForm.cloneNode()
      packageForm.style.animation = 'copy 0.5s'
      packageForm.style.animationTimingFunction = 'ease-out'

      this.placeholderElement.style.opacity = 0.8
      this.placeholderElement.style.height = '0px'
      this.placeholderElement.classList.add('placeholder')

      packageForm.style.position = 'absolute'
      packageForm.style.left = left + 'px'
      packageForm.style.top = top + 'px'
      packageForm.style.zIndex = '1000'

      this.copyElement = {
        el: packageForm,
        information: {
          origin: {
            left: left,
            top: top,
            width: packageForm.offsetWidth,
            height: packageForm.offsetHeight,
            index: Math.floor(top / packageForm.offsetHeight),
          },
        },
      }
    },
    copyEvent(e) {
      const { el: copyEle, information } = this.copyElement
      information.origin.deviationY = information.origin.deviationY || e.offsetY

      copyEle.style.top = e.pageY - information.origin.deviationY + 'px'
      this.flow(e)
    },
    flow(e) {
      const { height: itemHeight } = this.copyElement.information.origin
      const baseLineTop =
        this.findDraggableSectionPosition(
          this.copyElement.el,
          false /*no use cache*/
        ).top +
        itemHeight / 2

      const copyToIndex = Math.floor(baseLineTop / itemHeight) - 1
      if (this.cacheCopyToIndex === copyToIndex) return
      this.cacheCopyToIndex = copyToIndex
      const beforeEle = this.draggableSection.childNodes[0].childNodes[0].childNodes.item(
        copyToIndex + this.NumberOfPlaceHolderElementBefore(copyToIndex)
      )
      this.removePlaceholderElement()
      this.insertPlaceholderElement(beforeEle)
    },
    NumberOfPlaceHolderElementBefore(copyToIndex) {
      //When needing to add to the last
      if (
        this.constraints.length === 1 ||
        copyToIndex > this.constraints.length - 1
      )
        return null

      const container = this.draggableSection.childNodes[0].childNodes[0]
      //the copyToIndex is unreliable cause before it there will be some dom without height but still not destroyed
      let trulyIndex = 0
      while (
        !container.childNodes
          .item(++trulyIndex)
          .className.includes('placeholder')
          ? --copyToIndex > 0
          : true
      )
        continue
      return Array.from(container.childNodes)
        .slice(0, trulyIndex)
        .reduce(
          (result, item) =>
            item.className.includes('placeholder') ? ++result : result,
          0
        )
    },
    removePlaceholderElement() {
      const { prePlaceholderElement } = this
      if (!prePlaceholderElement) return
      prePlaceholderElement.style.transition = '0.3s'
      prePlaceholderElement.style.transitionTimingFunction = 'ease-out'
      prePlaceholderElement.style.height = '0px'

      setTimeout(() => {
        this.placeHolderEleNumber--
        this.draggableSection.childNodes[0].childNodes[0].removeChild(
          prePlaceholderElement
        )
      }, 316)
    },
    insertPlaceholderElement(beforeEle) {
      const { placeholderElement } = this
      this.draggableSection.childNodes[0].childNodes[0].insertBefore(
        placeholderElement,
        beforeEle
      )
      this.placeHolderEleNumber++
      placeholderElement.style.transition = '0.3s'
      placeholderElement.style.transitionTimingFunction = 'ease-out'
      //For newly inserted dom, setting transition and style at the same time will cause the animation not to execute
      requestAnimationFrame(() => {
        placeholderElement.style.height =
          this.copyElement.information.origin.height + 'px'
      })

      this.prePlaceholderElement = placeholderElement
      this.placeholderElement = placeholderElement.cloneNode()
    },
    finishCopy(e) {
      const {
        information: {
          origin: { index },
        },
      } = this.copyElement

      if (this.prePlaceholderElement) {
        const container = this.draggableSection.childNodes[0].childNodes[0]
        const insertIndex = Array.from(container.childNodes).findIndex(
          (item) => item === this.prePlaceholderElement
        )
        // while (this.placeHolderEleNumber > 0) continue

        this.newRowHandler(
          insertIndex - 1,
          cloneDeep(this.constraints[index]),
          true /*no transition*/
        )

        //fix issue that flashQueue is
        this.waitingMacroTask = true

        //clear
        container.removeChild(this.prePlaceholderElement)
        this.placeHolderEleNumber--
      }
      document.body.removeChild(this.copyElement.el)

      this.currentCopiedElement = null
    },
    findDraggableSectionPosition: cache(function(el) {
      let left = 0,
        top = 0,
        width = el.offsetWidth,
        height = el.offsetHeight
      while (el && !el.className.includes('draggable-section')) {
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
}
