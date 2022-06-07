import { FormType } from '../utils/Enum'

let keyIndex = 0

export const defaultUniqueInfo = (unique) => {
  switch (unique) {
    case FormType.Radio:
    case FormType.Checkbox:
    case FormType.Select:
      return { options: [{ text: 'default', value: 'default_1' }] }

    case FormType.Input:
    case FormType.Switch:
    case FormType.TextArea:
    case FormType.SlotScope:
    case FormType.Slider:
    case FormType.TimePicker:
    case FormType.DateTimePiker:
    case FormType.Upload:
    case FormType.Date:
    case FormType.Cascader:
      return {}
    default:
      return null
  }
}

class Form {
  constructor(o = {}) {
    //代理
    ;(function(_this, value = null) {
      Object.defineProperty(_this, 'formType', {
        configurable: true,
        enumerable: true,
        get() {
          return value
        },
        set(val) {
          if (value === val || !(value = val)) return
          this.uniqueInfo = defaultUniqueInfo(val)
          console.log(this.uniqueInfo)
        },
      })
    })(this)
    this._reset(o)
  }
  setUniqueItem(itemInfo = {}) {
    this.uniqueInfo = itemInfo
  }
  reset() {
    this._reset()
  }
  _reset(o = {}) {
    this.label = o.label || 'default a label'

    this.formType = FormType.Input
    this.labelLeft = null
    this.labelRight = null
    this.required = false
    this.disabled = false
    this.dataKey = o.dataKey || `default_${keyIndex++}`
    this.prop = null
    this.name = null
    this.cols = null
    this.formCols = null
    this.uniqueInfo = null
  }
  updateUniqueInfo(val) {
    this.uniqueInfo = val
  }
  get formInfo() {
    if (this.formType === FormType.SlotScope) {
      return { formType }
    }
    const info = {
      formType: this.formType,
      ...this,
      ...this.uniqueInfo,
    }
    delete info.uniqueInfo
    return info
  }
}

export { Form }
