let eventIndex = 0
const _event = {}
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
    const cb = args.length > 0 ? args[args.length - 1] : null
    args = args.slice(0, args.length - 1)

    const event = _event[eventName]
    if (!event) return console.error('no such event')
    if (Array.isArray(event)) {
      await Promise.all(
        event.map((e) => {
          e.once && this.off(eventName, e)
          return e.apply(Object.create(null), args)
        })
      )
      cb && cb()
    } else {
      event.once && this.off(eventName)
      await event.apply(Object.create(null), args)
      cb && cb()
    }
    return this
  }

  off(eventName, fn) {
    if (!_event[eventName]) {
      console.error('no such event')
      return this
    }
    if (!fn) {
      _event[eventName] = null
    } else {
      if (_event[eventName] === fn) {
        _event[eventName] = null
      } else {
        if (Array.isArray(_event[eventName])) {
          for (let i = 0, l = _event[eventName].length; i < l; i++) {
            if (_event[eventName][i] === fn) {
              _event[eventName].splice(i, 1)
              return this
            }
          }
        }
        console.error(`${eventName} don't have ${fn} callback function`)
        return this
      }
    }

    return this
  }
  once(eventName, fn) {
    const func = function() {
      return fn()
    }
    func.once = true
    this.on(eventName, func)
  }
}
