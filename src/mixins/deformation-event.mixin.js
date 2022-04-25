export default {
  data() {
    return {
      currentDeformElement: null,
    }
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
  methods: {
    resolveDeformInDownEvent(target, e) {
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
  },
}
