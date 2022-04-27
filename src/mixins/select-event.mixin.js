import { cache, cloneDeep } from '../utils'
import { MenuEnum } from '../utils/Enum'

export default {
  data() {
    return {
      beginRowIndex: Number.POSITIVE_INFINITY,
      endRowIndex: Number.POSITIVE_INFINITY,
      height: 0,
      top: 0,
      selectElement: [],
      elementWM: new WeakMap(),
      animationWM: new WeakMap(),
      canvasGC: [],
    }
  },
  watch: {
    endRowIndex(val) {
      if (Number.isSafeInteger(val)) {
        this.findSelectElement()
      }
    },
    selectElement(val, oldVal) {
      if (val.length > oldVal.length) {
        val
          .filter((ele) => !oldVal.some((e) => ele.isSameNode(e)))
          .reduce(
            (wm, ele) => wm.set(ele, this.createCanvas(ele)),
            this.elementWM
          )
      } else if (val.length < oldVal.length) {
        oldVal
          .filter((ele) => !val.some((e) => ele.isSameNode(e)))
          .forEach((ele) => {
            this.canvasGC.push(this.elementWM.get(ele))
            this.elementWM.delete(ele)
          })
      }
    },
  },
  created() {
    this.rewriteCanvasGC()
  },
  methods: {
    rewriteCanvasGC() {
      const _this = this
      const push = this.canvasGC.push
      const proto = Object.create(this.canvasGC.__proto__)
      proto.push = function(...ele) {
        ele.forEach((ele) => {
          if (!ele instanceof Node) return
          _this.drawContext(ele, true /*out*/)
        })
        return push.call(this, ...ele)
      }
      this.canvasGC.__proto__ = proto
    },
    resolveSelectInDownEvent() {
      if (this.selectElement.length) this.resetSelectElement()
    },
    initSelectEvent(startElement) {
      this.top = this.findPagePosition(
        document.querySelector('.context-box')
      ).top
      this.height = startElement.position.bottom - startElement.position.top
      this.beginRowIndex = this.findRowIndex(startElement.position.top + 1)
    },
    findRowIndex(position) {
      return Math.floor((position - this.top) / this.height)
    },
    selectEvent(e) {
      this.endRowIndex = this.findRowIndex(e.pageY)
    },
    finishSelect() {
      //do something
    },
    resetSelectElement() {
      this.selectElement = []
    },
    // resetCopyEvent() {
    //   this.selectElement = []
    //   this.beginRowIndex = Number.POSITIVE_INFINITY
    //   this.endRowIndex = Number.POSITIVE_INFINITY
    // },
    findSelectElement() {
      this.resetSelectElement()
      Array.from(document.getElementsByClassName('content')).forEach(
        (ele, index) => {
          if (
            (this.beginRowIndex >= Number(index) &&
              this.endRowIndex <= Number(index)) ||
            (this.beginRowIndex <= Number(index) &&
              this.endRowIndex >= Number(index))
          ) {
            this.selectElement.push(ele)
          }
        }
      )
    },
    createCanvas(ele) {
      let canvas
      if (this.canvasGC.length) {
        canvas = this.canvasGC.pop()
      } else {
        canvas = this.genCanvas()
      }

      canvas.width = ele.offsetWidth
      canvas.height = ele.offsetHeight

      this.drawContext(canvas)

      ele.appendChild(canvas)
      return canvas
    },
    genCanvas() {
      const canvas = document.createElement('canvas')
      canvas.style.top = '0px'
      canvas.style.left = '0px'
      canvas.style.zIndex = '1001'
      canvas.style.position = 'absolute'

      return canvas
    },

    drawContext(canvas, out) {
      if (this.animationWM.has(canvas)) {
        cancelAnimationFrame(this.animationWM.get(canvas))
      }
      if (!out) requestAnimationFrame(() => (canvas.style.display = 'block'))
      const context = canvas.getContext('2d')
      const { width, height } = canvas

      const animation = () => {
        context.clearRect(0, 0, width, height)
        context.globalAlpha =
          (context.globalAlpha === 1 ? 0.1 : context.globalAlpha) +
          (out ? -0.04 : 0.04)
        context.globalCompositionOperation = 'source-out'
        context.fillStyle = '#c1e9ff'
        context.fillRect(0, 0, width, height)
        context.moveTo(-50, height)
        context.lineTo(width / 2 - 50, 0)
        context.lineTo(width / 2 + 50, 0)
        context.lineTo(50, height)

        context.moveTo(width + 50, 0)
        context.lineTo(width / 2 + 50, height)
        context.lineTo(width / 2 - 50, height)
        context.lineTo(width - 50, 0)

        context.fillStyle = '#cfeeff'
        context.fill()

        if (!out && context.globalAlpha >= 0.6) return
        if (out && context.globalAlpha <= 0.1)
          return (canvas.style.display = 'none')
        this.animationWM.set(canvas, requestAnimationFrame(animation))
      }
      requestAnimationFrame(animation)
    },
  },
}
