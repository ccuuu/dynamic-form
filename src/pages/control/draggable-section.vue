<script>
const regs = {
  checkBoxReg: /^el-(checkbox)/,
  sliderReg: /^el-(slider)(?!\S)/,
  radioReg: /^el-(radio)/,
  switchReg: /^el-(switch)/,
  timePickerRge: /el-(time-picker)/,
  dateTimePickerRge: /el-(date-time-picker)/,
  uploadReg: /^el-(upload)/,
  textAreaReg: /^el-(textarea)/,
  dateReg: /el-(date)(?!-)/,
  selectReg: /el-(select)/,
  slotScopeReg: /el-(slot-scope)/,
  cascaderReg: /el-(cascader)/,
  inputReg: /(?<!.*(?:el-textarea|el-date|el-select).*)el-(input)/,
}
const dragTag = /(label|div)/i

import { FormType } from '../../utils/Enum'
import { cache } from '../../utils/index'

export default {
  name: 'draggable-section',
  render(_c) {
    const _this = this
    const createBasic = () => {
      return _c(
        'div',
        {
          ref: 'draggableSection',
          attrs: { id: 'draggable-section' },
          directives: [
            {
              name: 'drag',
              value: _this,
            },
          ],
        },
        createContent()
      )
    }
    const createContent = () => {
      return [
        createFirstLine(),
        createSecondLine(),
        createThirdLine(),
        createFourthLine(),
        createFifthLine(),
      ]
    }
    const createFirstLine = () => {
      return _c(
        'el-row',
        {
          style: 'margin:8px 0 8px 0',
          props: { type: 'flex', justify: 'space-between' },
        },
        [
          createCol(
            7,
            createInput({
              attrs: { placeholder: 'input' },
            })
          ),
          createCol(
            7,
            createInput({
              class: 'el-select',
              attrs: { placeholder: 'select' },
              props: { suffixIcon: 'el-icon-arrow-down' },
            })
          ),
          createCol(
            7,
            createInput({
              class: 'el-date',
              attrs: { placeholder: 'date' },
              props: { prefixIcon: 'el-icon-date' },
            })
          ),
        ]
      )
    }
    const createSecondLine = () => {
      return _c(
        'el-row',
        {
          style: 'margin:20px 0 20px 0',
          props: { type: 'flex', justify: 'space-between' },
        },
        [
          createCol(7, _c('el-switch')),
          createCol(7, createCheckbox()),

          createCol(7, _c('el-radio', { props: { label: 'radio' } })),
        ]
      )
    }
    const createThirdLine = () => {
      return _c(
        'el-row',

        {
          style: 'margin:20px 0 20px 0',
          props: { type: 'flex', justify: 'space-between' },
        },
        [
          createCol(
            7,
            createInput({
              class: 'el-cascader',
              attrs: { placeholder: 'cascader' },
              props: { suffixIcon: 'el-icon-arrow-down' },
            })
          ),

          createCol(
            7,
            createInput({
              class: 'el-time-picker',
              attrs: { placeholder: 'time piker' },
              props: { prefixIcon: 'el-icon-time' },
            })
          ),
          createCol(
            7,
            createInput({
              class: 'el-date-time-picker',
              attrs: { placeholder: 'date time piker' },
              props: { prefixIcon: 'el-icon-time' },
            })
          ),
        ]
      )
    }
    const createFourthLine = () => {
      return _c(
        'el-row',

        {
          style: 'margin:20px 0 20px 0',
          props: { type: 'flex', justify: 'space-between' },
        },
        [createCol(10, createSlotScope()), createCol(10, createSlider())]
      )
    }
    const createFifthLine = () => {
      return _c(
        'el-row',
        {
          style: 'margin:20px 0 20px 0',
          props: { type: 'flex', justify: 'space-between' },
        },
        [
          createCol(
            11,
            _c('el-input', {
              attrs: { type: 'textarea' },
            })
          ),
          createCol(
            11,
            _c(
              'div',
              {
                class: 'el-upload el-upload--picture-card',
                style: 'width: 100%; height: 54px;line-height: 59px;',
              },
              [
                _c('i', { class: 'el-icon-plus' }),
                _c('input', {
                  class: 'el-upload__input',
                  attrs: { type: 'file', name: 'file' },
                  on: {
                    click(e) {
                      e.preventDefault()
                      e.stopPropagation()
                    },
                  },
                }),
              ]
            )
          ),
        ]
      )
    }
    const createCol = (span, child) => {
      if (!Number.isSafeInteger(span)) {
        child = span

        span = null
      }
      return _c(
        'el-col',
        { props: { span }, style: 'position:relative' },
        Array.isArray(child) ? child : [child]
      )
    }
    const createInput = (data) => {
      return _c('el-input', data)
    }
    const createCheckbox = () => {
      return _c('label', { class: 'el-checkbox' }, [
        _c('span', { class: 'el-checkbox__input' }, [
          _c('span', { class: 'el-checkbox__inner' }),
        ]),
        _c(
          'span',
          { class: 'el-checkbox__label', style: 'padding-left:6px' },
          'Checkbox'
        ),
      ])
    }
    const createSlotScope = () => {
      return _c(
        'div',
        {
          class: 'el-slot-scope',
          style:
            'display:flex;flex-direction:column;height:40px;justify-content:space-between',
        },
        [
          _c(
            'div',
            {
              style: `width:50%;`,
              class: 'slot-scope-skeleton',
            },
            [
              _c(
                'span',
                {
                  class: 'slot-scope-font',
                },
                'SlotScope'
              ),
            ]
          ),
          _c('div', {
            style: 'width:100%;',
            class: 'slot-scope-skeleton',
          }),
          _c('div', {
            style: 'width:100%;',
            class: 'slot-scope-skeleton',
          }),
        ]
      )
    }
    const createSlider = () => {
      return _c('div', { class: 'el-slider' }, [
        _c('div', { class: 'el-slider__runway' }, [
          _c('div', {
            class: 'el-slider__bar',
            style: 'width: 40%; left: 0%;',
          }),
          _c(
            'div',
            { class: 'el-slider__button-wrapper', style: 'left:40%;' },
            [_c('div', { class: 'el-tooltip el-slider__button' })]
          ),
        ]),
      ])
    }
    return createBasic()
  },
  directives: {
    drag: {
      bind(e, { value: _this }) {
        //prevent checkbox focus style

        //find and clone current element
        e.addEventListener('mousedown', _this.mousedownEvent)
        //remove clone element from document
        document.addEventListener('mouseup', _this.mouseupEvent)
        //cover the element ui mouse hover style
        e.addEventListener('mousemove', _this.preventCursorStyle)
      },
      unbind(e, { value: _this }) {
        e.removeEventListener('mousedown', _this.mousedownEvent)
        document.removeEventListener('mouseup', _this.mouseupEvent)
        e.removeEventListener('mousemove', _this.preventCursorStyle)
      },
    },
  },
  data() {
    return {
      that: this,
      timer: null,
      currentElement: null,
      cloneElement: null,
      menuEvent: false,
      dragEvent: false,
      shouldCheckEvent: true,
    }
  },
  props: {
    form: {
      type: Object,
      required: true,
    },
    collectInfo: {
      type: Object,
      required: true,
    },
  },
  watch: {
    currentElement(val) {
      if (val) {
        document.addEventListener('mousemove', this.dragEventCallBack)
      } else {
        this.cloneElement && document.body.removeChild(this.cloneElement)
        this.cloneElement = null
        document.removeEventListener('mousemove', this.dragEventCallBack)
      }
    },
  },
  methods: {
    resetForm() {
      this.form.reset()
    },
    isDraggableElement(classValue) {
      return Object.values(regs).some((reg) => reg.test(classValue))
    },
    findDragElement(e) {
      let { target } = e
      while (
        !(
          this.isDraggableElement(target.className) &&
          dragTag.test(target.tagName)
        ) &&
        (target = target.parentNode)
      ) {
        continue
      }
      return target
    },
    copyVirtualElement(ele, e) {
      //这里需要优化：需要将布局变为control菜单栏固定，此时可以使用缓存
      const { left, top } = this.findPagePosition(ele, false /* no use cache */)
      this.cloneElement = ele.cloneNode(true)
      const { cloneElement } = this
      //use will-change
      cloneElement.style.willChange = 'top, left'
      cloneElement.style.position = 'absolute'
      cloneElement.style.left = Math.floor(left) + 'px'
      cloneElement.style.top = Math.floor(top) + 'px'
      cloneElement.style.width = ele.offsetWidth + 'px'
      cloneElement.style.zIndex = 1002
      cloneElement.style.animation = 'clone 0.3s'

      const { left: deviationL, top: deviationT } =
        this.findParentPositionByClass(e.target, 'el-col')
      cloneElement.setAttribute('data-deviation-x', e.offsetX + deviationL)
      cloneElement.setAttribute('data-deviation-y', e.offsetY + deviationT)
      document.body.appendChild(cloneElement)
    },
    dragEventCallBack(e) {
      const { cloneElement } = this
      const deviationX = cloneElement.getAttribute('data-deviation-x') - 0
      const deviationY = cloneElement.getAttribute('data-deviation-y') - 0
      cloneElement.style.left = e.pageX - deviationX + 'px'
      cloneElement.style.top = e.pageY - deviationY + 'px'
    },
    mousedownEvent(e) {
      //prevent ElementUI's default animation effect
      e.stopPropagation()
      e.preventDefault()
      this.menuEvent = false
      this.dragEvent = false

      //shouldCheckEvent to prevent timeout call back recursion
      if (this.shouldCheckEvent && !this.timer) {
        this.shouldCheckEvent = false
        this.timer = setTimeout(() => {
          this.timer = null
          if (this.menuEvent) return
          this.mousedownEvent(e)
        }, 300)
      }

      if (e.button !== 0 || this.timer) return
      this.dragEvent = true
      this.addAndResetCollectInfo()
      this.form.formType = this.obtainType(e)
      this.resolveDragElement(e)
    },
    mouseupEvent(e) {
      this.shouldCheckEvent = true
      if ((this.menuEvent = !!this.timer)) {
        this.form.formType = this.obtainType(e)
        this.$emit('resetCollectFormType', this.form.formType)
      }
      if (e.button !== 0 || !this.currentElement) return
      Promise.resolve().then(() => {
        this.resetForm()
      })
      this.$eventEmitter.emit('addElement', e)
      this.currentElement = null
    },
    addAndResetCollectInfo() {
      this.form.updateUniqueInfo(this.collectInfo)
      this.$emit('resetCollectInfo')
    },
    preventCursorStyle(e) {
      if (!e.target || e.target.style.cursor === 'pointer') return
      e.target.style.cursor = 'pointer'
    },

    resolveDragElement(e) {
      let target = this.findElementByParentClassName(e.target, 'el-col')
      let classValue = target.classList.value
      if (this.isDraggableElement(classValue)) {
        this.currentElement = target
        target = this.findDragElement(e)
        target && this.copyVirtualElement(target, e)
      }
    },

    obtainType(e) {
      let target = this.findElementByParentClassName(e.target, 'el-col')
      let classValue = target.classList.value

      for (const key in regs) {
        if (regs[key].test(classValue)) {
          return classValue.match(regs[key])[1]
        }
      }
      return ''
    },

    findElementByParentClassName(ele, klass) {
      while (ele && !ele.parentNode.className.includes(klass)) {
        ele = ele.parentNode
      }
      return ele
    },

    findPagePosition: cache(function (el) {
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
    findParentPositionByClass: cache(function (el, className) {
      let left = 0,
        top = 0,
        width = el.offsetWidth,
        height = el.offsetHeight
      while (el && el.offsetParent && !el.className.includes(className)) {
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
</script>
<style>
#draggable-section {
  position: relative;
  margin-top: 24px;
  padding: 8px;
}
#draggable-section .el-row {
  z-index: 5;
}
@keyframes clone {
  0% {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(1.1, 1.1);
    color: black;
  }
  100% {
    transform: scale(1, 1);
  }
}
.slot-scope-skeleton {
  height: 11px;
  border-radius: 4px;
  background: #bdcdf1;
}
.slot-scope-font {
  font-size: 10px;
  color: gray;
  transform: translate(4px, -8px);
  display: inline-block;
}

#draggable-section::before,
#draggable-section::after {
  content: '';
  border: 4px solid #abbde7;
  opacity: 0.8;
  position: absolute;
  width: calc(100% + 8px);
  height: calc(100% - 8px);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 8px;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
  z-index: 0;
}

#draggable-section::after {
  clip-path: inset(92% 95% 0 0);
}
#draggable-section::before {
  clip-path: inset(0 0 92% 95%);
}
#draggable-section:hover::after {
  clip-path: inset(50% 50% 0 0);
  border: 4px solid #b8c5ff99;
}
#draggable-section:hover::before {
  clip-path: inset(0 0 50% 50%);
  border: 4px solid #b8c5ff99;
}
</style>
