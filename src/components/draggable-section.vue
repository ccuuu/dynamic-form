<template>
  <div class="draggable-section" ref="draggableSection" v-drag="that">
    <el-row style="margin:8px 0 8px 0" type="flex" justify="space-between">
      <el-col :span="7"><el-input></el-input></el-col>
      <el-col :span="7">
        <el-input class="el-select" suffix-icon="el-icon-arrow-down"></el-input>
      </el-col>
      <el-col :span="7">
        <el-input class="el-date" prefix-icon="el-icon-date"></el-input>
      </el-col>
    </el-row>
    <el-row style="margin:20px 0 20px 0">
      <el-col :span="8">
        <el-switch></el-switch>
      </el-col>
      <el-col :span="8">
        <label class="el-checkbox">
          <span class="el-checkbox__input">
            <span class="el-checkbox__inner"></span>
          </span>
          <span class="el-checkbox__label" style="padding-left:6px"
            >checkBox</span
          >
        </label>
      </el-col>
      <el-col :span="8">
        <el-radio label="radio"></el-radio>
      </el-col>
    </el-row>

    <el-input type="textarea"></el-input>
  </div>
</template>
<script>
const checkBoxReg = /^el-checkbox/
const radioReg = /^el-radio/
const switchReg = /^el-switch/
const inputReg = /(?<!.*(el-textarea|el-date|el-select).*)el-input/
const textAreaReg = /^el-textarea/
const dateReg = /el-date/
const selectReg = /el-select/
const dragTag = /(label|div)/i

new Event('longPress')

export default {
  name: 'draggable-section',
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
      menuEvent: null,
      shouldCheckEvent: true,
    }
  },
  props: {
    form: {
      type: Object,
      required: true,
    },
  },
  watch: {
    currentElement(val) {
      if (val) {
        document.addEventListener('mousemove', this.dragEventCallBack)
      } else {
        document.body.removeChild(this.cloneElement)
        this.cloneElement = null
        document.removeEventListener('mousemove', this.dragEventCallBack)
      }
    },
  },
  methods: {
    resetForm() {
      this.form.label = 'default a label'
      this.form.labelLeft = null
      this.form.labelRight = null
      this.form.formType = null
    },
    isMoveableElement(classValue) {
      return (
        switchReg.test(classValue) ||
        radioReg.test(classValue) ||
        checkBoxReg.test(classValue) ||
        textAreaReg.test(classValue) ||
        inputReg.test(classValue) ||
        dateReg.test(classValue) ||
        selectReg.test(classValue)
      )
    },
    findDragElement(e) {
      let { target } = e
      while (
        (target = target.parentNode) &&
        !(
          this.isMoveableElement(target.className) &&
          dragTag.test(target.tagName)
        )
      )
        continue
      return target
    },
    copySameElement(ele, e) {
      const { left, top } = ele.getBoundingClientRect()
      this.cloneElement = ele.cloneNode(true)
      const { cloneElement } = this
      cloneElement.style.position = 'absolute'
      cloneElement.style.left = Math.floor(left) + 'px'
      cloneElement.style.top = Math.floor(top) + 'px'
      cloneElement.style.width = ele.offsetWidth + 'px'
      cloneElement.setAttribute('data-deviation-x', e.offsetX)
      cloneElement.setAttribute('data-deviation-y', e.offsetY)
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

      let target = e.target
      let classValue = target.classList.value
      const { form } = this
      if (this.isMoveableElement(classValue)) {
        this.currentElement = target.parentNode
        target = this.findDragElement(e)
        this.copySameElement(target, e)
      }
      classValue = target.className
      if (switchReg.test(classValue)) {
        form.formType = 'switch'
      } else if (radioReg.test(classValue)) {
        form.formType = 'radio'
      } else if (checkBoxReg.test(classValue)) {
        form.formType = 'checkBox'
      } else if (textAreaReg.test(classValue)) {
        form.formType = 'textArea'
      } else if (inputReg.test(classValue)) {
        form.formType = 'input'
      } else if (dateReg.test(classValue)) {
        form.formType = 'date'
      } else if (selectReg.test(classValue)) {
        form.formType = 'select'
      }
    },
    mouseupEvent(e) {
      this.shouldCheckEvent = true
      this.menuEvent = !!this.timer
      if (e.button !== 0) return
      Promise.resolve().then(() => {
        this.resetForm()
      })
      this.$emit('addElement', e)
      if (!this.currentElement) return
      this.currentElement = null
    },
    preventCursorStyle(e) {
      if (!e.target || e.target.style.cursor === 'pointer') return
      e.target.style.cursor = 'pointer'
    },
  },
}
</script>
<style scoped>
.draggable-section {
  margin-top: 24px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 8px;
}
</style>
