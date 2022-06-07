//该创建函数在vue中是不适用的。事实上一切对于数组的子类继承，在vue中都是不适用的。
//因为vue的数据监听需要改变数组的原型，而二次封装的类会被此行为覆盖
function createConstraints() {
  //盗用构造函数
  class Constraints extends Array {}

  //原型式继承
  function create(o) {
    function Fn() {}
    Fn.prototype = o
    return new Fn()
  }

  function parasitic(constraintsProto) {
    const origin = Array.prototype

    constraintsProto.constructor = Constraints
    const constraintsItemProto = create(origin)
    rewriteCore(constraintsProto, constraintsItemProto)
    return constraintsProto
  }

  //寄生
  parasitic(Constraints.prototype)

  return Constraints
}

export function rewriteCore(constraintsProto, constraintsItemProto) {
  //为了妥协vue对数组的拦截限制。此处的origin必须动态从参数的原型中获取
  const origin = constraintsItemProto.__proto__
  function define(target, key, value) {
    Object.defineProperty(target, key, {
      configurable: false,
      enumerable: false,
      writable: false,
      value,
    })
    return value
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
      const res = origin[method].apply(this, basic.concat([formatArgs]))
      return res
    })

    define(constraintsProto, method, function constrainsArrayMethod(...args) {
      const _this = this
      //splice(0,2,...)，只需要删除一次
      let deleted = false

      if (!args.length) return

      const { basic, formatArgs } = formatParams(args, function(args) {
        return args.map((i) => (!Array.isArray(i) ? [i] : i))
      })

      if (!formatArgs.length) return origin[method].apply(this, basic)

      const buffer = new Uint32Array(1)
      //single params
      if (!Array.isArray(formatArgs[0])) {
        define(formatArgs, 'key', crypto.getRandomValues(buffer)[0] + '')
      } else {
        return (method === 'splice' ? formatArgs.reverse() : formatArgs).every(
          (i) => {
            define(i, 'key', crypto.getRandomValues(buffer)[0] + '')
            return defineAndCallMethod(i)
          }
        )
      }

      function defineAndCallMethod(arrItem) {
        if (method === 'splice' && deleted) {
          basic[1] = 0
        }
        deleted = true
        arrItem.__proto__ = constraintsItemProto
        return genForceUpdate.apply(_this, basic.concat([arrItem]))
      }
      return defineAndCallMethod(formatArgs)
    })
  })
}
export const Constraints = createConstraints()
