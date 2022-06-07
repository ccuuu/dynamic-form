let eventIndex = 0
let _event = {}
export class EventEmitter {
  constructor() {}
  showEvent() {
    return _event
  }

  on(eventName, fn, important) {
    if (!_event.hasOwnProperty(eventName)) {
      _event[eventName] = fn
    } else {
      _event[eventName] = Array.isArray(_event[eventName])
        ? _event[eventName]
        : [_event[eventName]]
      _event[eventName][important ? 'unshift' : 'push'](fn)
    }
    return this
  }

  async emit(eventName, ...args) {
    const {length} = args
    let cb
    if(length === 1 && typeof args[0] === 'function'){
       cb = args[0]
       args.length = 0
    }else if(typeof args.at(-1) === 'function'){
      cb = args.at(-1)
      args = args.slice(0, args.length - 1)
    }

    const event = _event[eventName]
    if (!event) return console.error('no such event')
    if (Array.isArray(event)) {
      await Promise.all(
        event.map((e) => {
          return e.apply(Object.create(null), args)
        })
      )
    } else {
      await event.apply(Object.create(null), args)
    }
    cb && cb()
    return this
  }

  off(eventName, fn) {
    if (!eventName) _event = Object.create(null)
    if (!_event[eventName]) {
      console.error('no such event')
      return this
    }
    if (!fn) {
      _event[eventName] = null
    } else {
      if (_event[eventName] === fn || _event[eventName].fn === fn) {
        _event[eventName] = null
      } else {
        if (Array.isArray(_event[eventName])) {
          for (let i = 0, l = _event[eventName].length; i < l; i++) {
            if (_event[eventName][i] === fn || _event[eventName].fn === fn) {
              _event[eventName].splice(i, 1)
              return this
            }
          }
        }
        console.error(`${eventName} don't have such callback function: ${fn}`)
        return this
      }
    }

    return this
  }
  once(eventName, fn) {
    const func = function() {
      this.off(eventName, func)
      return fn.apply(Object.create(null), arguments)
    }
    func.fn = fn
    this.on(eventName, func)
  }
  get [Symbol.toStringTag]() {
    return 'EventEmitter'
  }
}
