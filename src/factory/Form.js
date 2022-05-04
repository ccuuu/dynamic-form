import Vue from 'vue'

let keyIndex = 0

class Form {
  constructor(o = {}) {
    this.label = o.label || 'default a label'

    //basic
    this.labelLeft = null
    this.labelRight = null
    this.formType = null
    this.required = false
    this.disabled = false
    this.dataKey = `default_${keyIndex++}`
    this.prop = null
    this.name = null
    this.cols = null
    this.formCols = null
  }
  addUniqueItem(itemInfo = {}) {
    for (const [key, item] of itemInfo.entires()) {
      Vue.prototype.$set(this, key, item)
    }
  }
  reset() {
    this._reset()
  }
  _reset() {
    this.label = o.label || 'default a label'

    this.labelLeft = null
    this.labelRight = null
    this.formType = null
    this.required = false
    this.disabled = false
    this.dataKey = `default_${keyIndex++}`
    this.prop = null
    this.name = null
    this.cols = null
    this.formCols = null
  }
}

export { Form }
