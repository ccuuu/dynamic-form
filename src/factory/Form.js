import Vue from 'vue'

let keyIndex = 0

class constraints extends Array {
  export() {
    return this._format
  }
  get _format() {
    return Array.from(this)
  }
}

const constraintsProto = Object.create(Array.prototype),
  constraintsItemProto = Object.create(Array.prototype)

function define(arr, key, methods) {
  Object.defineProperty(arr, key, {
    configurable: false,
    enumerable: false,
    writable: false,
    value: methods,
  })
  return methods
}

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
    const res = origin[method].call(this, ...basic, formatArgs)
    return res
  })

  define(constraintsProto, method, function constrainsArrayMethod(...args) {
    const _this = this
    if (!args.length) return

    const { basic, formatArgs } = formatParams(args, function(args) {
      return args.map((i) => (!Array.isArray(i) ? [i] : i))
    })

    if (!formatArgs.length) return origin[method].apply(this, basic)

    const buffer = new Uint32Array(1)
    //single params
    if (!Array.isArray(formatArgs[0])) {
      formatArgs.key = crypto.getRandomValues(buffer)[0] + ''
    } else {
      return (method === 'splice' ? formatArgs.reverse() : formatArgs).every(
        (i) => {
          i.key = crypto.getRandomValues(buffer)[0] + ''
          return defineAndCallMethod(i)
        }
      )
    }

    function defineAndCallMethod(arrItem) {
      arrItem.__proto__ = constraintsItemProto
      return genForceUpdate.call(_this, ...basic, arrItem)
    }
    return defineAndCallMethod(formatArgs)
  })
})

constraints.prototype = constraintsProto

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
