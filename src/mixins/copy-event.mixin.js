import { cache, cloneDeep } from '../utils'
import { MoveCaseEnum } from '../utils/Enum'

export default {
  data() {
    return {
      copyEventTimer: null,
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
        // document.body.addEventListener('mousemove', this.copyEvent)
      } else {
        // document.body.removeEventListener('mousemove', this.copyEvent)
        this.copyElement = null
        this.placeholderElement = null

        this.prePlaceholderElement = null
      }
    },
    placeHolderEleNumber(val) {
      if (val === 0 && this.waitingMacroTask) {
        const container = this.draggableSection.childNodes[0].childNodes[0]
        //fix issue: High is 0 when a new row is initialized
        const _this = this
        const observer = new MutationObserver(() => {
          _this.waitingMacroTask = false
          observer.disconnect()
        })
        observer.observe(container, {
          subtree: true,
          attributes: true,
          attributeFilter: ['class'],
        })
      }
    },
  },
  created() {
    this.drawActionAnimation()
  },
  methods: {
    resolveCopyInDownEvent(target, e) {
      this.isCopyEvent(
        function() {
          // this.toggleDomClickStyle(target, false /*remove style*/)
          this.finishEvent(
            e,
            true /*keep current element until delete manually */
          )
          return target
        }.bind(this)
      )
    },
    resolveCopyInMoveEvent(e) {
      //if mouse move, clear the copyEvent timer
      if (this.copyEventTimer && (e.movementX || e.movementY))
        this.clearCopyTimer()
      this.isCopyEvent(
        function() {
          this.finishEvent(
            e,
            true /*keep current element until delete manually */
          )
        }.bind(this)
      )
    },
    isCopyEvent(cb) {
      if (this.copyEventTimer) return
      this.copyEventTimer = setTimeout(() => {
        this.setAsCopyEvent(cb && cb())
      }, 450)
    },
    setAsCopyEvent(currentDeformElement) {
      this.currentCopiedElement = this.findParentByClass(
        currentDeformElement || this.currentDeformElement,
        'el-row'
      )
      this.currentDeformElement = null
      this.clearCopyTimer()
    },
    clearCopyTimer() {
      clearTimeout(this.copyEventTimer)
      this.copyEventTimer = null
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
      packageForm.style.backgroundColor = '#d8e3ff'
      packageForm.style.opacity = 0.8
      packageForm.style.width = currentCopiedElement.offsetWidth + 'px'
      packageForm.style.height = currentCopiedElement.offsetHeight + 'px'

      document.body.appendChild(packageForm)

      this.placeholderElement = packageForm.cloneNode()
      packageForm.style.animation = 'copy 0.4s'
      packageForm.style.animationTimingFunction = 'ease-out'

      this.placeholderElement.style.opacity = 0.8
      this.placeholderElement.style.height = '0px'
      this.placeholderElement.classList.add('placeholder')

      packageForm.style.position = 'absolute'
      packageForm.style.left = left + 'px'
      packageForm.style.top = top + 'px'
      packageForm.style.zIndex = '1000'
      packageForm.style.boxShadow = '0 5px 10px 0 rgb(0 0 0 / 10%)'

      this.drawActionAnimation(
        currentCopiedElement.offsetWidth,
        currentCopiedElement.offsetHeight,
        left,
        top
      )

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
    drawActionAnimation(width, height, left, top) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.style.position = 'absolute'
      canvas.style.left = left + 'px'
      canvas.style.top = top - 1 + 'px'
      canvas.style.zIndex = '1001'
      document.body.appendChild(canvas)
      const context = canvas.getContext('2d')
      const gradient = context.createLinearGradient(0, 0, 30, 90)
      gradient.addColorStop(0, 'white')
      gradient.addColorStop(0.5, '#f3fcff')
      gradient.addColorStop(1, '#e9faff')
      context.fillStyle = gradient
      context.rotate(Math.PI / 10)
      context.translate(0, -10)
      context.globalAlpha = 0.6

      const dateNow = Date.now()
      function animation() {
        if (Date.now() - dateNow >= 304) {
          document.body.removeChild(canvas)
          return
        }
        context.clearRect(-1, -1, 500, 500)
        context.fillStyle = gradient
        context.translate(width / 18, -width / 54)
        context.fillRect(0, 0, 30, 200)
        requestAnimationFrame(animation)
      }
      requestAnimationFrame(animation)
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
      //todo: repeated generate placeholderElement
      if (copyToIndex === this.cacheCopyToIndex) return
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
      }, 304)
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

        //fix issue that flashQueue is execute before dom remove
        this.waitingMacroTask = true

        //The principle of vue transition is to add the class name
        //If the timing is incorrect, it will cause the page to flicker
        const { prePlaceholderElement } = this
        const observer = new MutationObserver(() => {
          //clear
          container.removeChild(prePlaceholderElement)
          observer.disconnect()
        })
        observer.observe(container, {
          subtree: true,
          attributes: true,
          attributeFilter: ['class'],
        })

        this.newRowHandler(insertIndex - 1, index, true /*no transition*/)

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
