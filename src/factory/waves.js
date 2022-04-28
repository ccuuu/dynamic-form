const pi = Math.PI
const pi2 = 2 * Math.PI

class Waves {
  constructor(holder, options) {
    this.options = extend(options || {}, {
      resize: false,
      rotation: 45,
      waves: 5,
      width: 200,
      hue: [11, 14],
      amplitude: 0.5,
      background: true,
      preload: true,
      speed: [0.004, 0.008],
    })

    this.waves = []

    this.holder = document.querySelector(holder)
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.holder.appendChild(this.canvas)

    this.hue = this.options.hue[0]
    this.hueFw = true

    this.resize()
    this.init(this.options.preload)

    if (this.options.resize)
      window.addEventListener(
        'resize',
        function() {
          this.resize()
        },
        false
      )
  }
  init(preload) {
    const options = this.options

    for (let i = 0; i < options.waves; i++) this.waves[i] = new Wave(this)

    if (preload) this.preload()
  }
  preload() {
    const options = this.options

    for (let i = 0; i < options.waves; i++) {
      this.updateColor()
      for (let j = 0; j < options.width; j++) {
        this.waves[i].update()
      }
    }
  }
  render() {
    this.updateColor()
    this.clear()

    if (this.options.background) {
      this.background()
    }

    each(this.waves, function(wave, i) {
      wave.update()
      wave.draw()
    })
  }
  animate() {
    this.render()

    window.requestAnimationFrame(this.animate.bind(this))
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  background() {
    const ctx = this.ctx

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, this.width, this.height)
  }
  resize() {
    const width = this.holder.offsetWidth
    const height = this.holder.offsetHeight
    this.scale = window.devicePixelRatio || 1
    this.width = width * this.scale
    this.height = height * this.scale
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style.width = width + 'px'
    this.canvas.style.height = height + 'px'
    this.radius =
      Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2)) / 2
    this.centerX = this.width / 2
    this.centerY = this.height / 2
    //Waves.radius /= 2; // REMOVE FOR FULLSREEN
  }
  updateColor() {
    this.hue += this.hueFw ? 0.01 : -0.01

    if (this.hue > this.options.hue[1] && this.hueFw) {
      this.hue = this.options.hue[1]
      this.Waves = false
    } else if (this.hue < this.options.hue[0] && !this.hueFw) {
      this.hue = this.options.hue[0]
      this.Waves = true
    }

    const a = Math.floor(127 * Math.sin(0.3 * this.hue + 0) + 128)
    const b = Math.floor(127 * Math.sin(0.3 * this.hue + 2) + 128)
    const c = Math.floor(127 * Math.sin(0.3 * this.hue + 4) + 128)

    this.color = 'rgba(' + a + ',' + b + ',' + c + ', 0.1)'
  }
}

class Wave {
  constructor(Waves) {
    const speed = Waves.options.speed

    this.Waves = Waves
    this.Lines = []

    this.angle = [rnd(pi2), rnd(pi2), rnd(pi2), rnd(pi2)]

    this.speed = [
      rnd(speed[0], speed[1]) * rnd_sign(),
      rnd(speed[0], speed[1]) * rnd_sign(),
      rnd(speed[0], speed[1]) * rnd_sign(),
      rnd(speed[0], speed[1]) * rnd_sign(),
    ]

    return this
  }
  update() {
    const Lines = this.Lines
    const color = this.Waves.color

    Lines.push(new Line(this, color))

    if (Lines.length > this.Waves.options.width) {
      Lines.shift()
    }
  }
  draw() {
    const Waves = this.Waves

    const ctx = Waves.ctx
    const radius = Waves.radius
    const radius3 = radius / 3
    const x = Waves.centerX
    const y = Waves.centerY
    const rotation = dtr(Waves.options.rotation)
    const amplitude = Waves.options.amplitude

    const Lines = this.Lines

    each(Lines, function(line, i) {
      const angle = line.angle

      const x1 = x - radius * Math.cos(angle[0] * amplitude + rotation)
      const y1 = y - radius * Math.sin(angle[0] * amplitude + rotation)
      const x2 = x + radius * Math.cos(angle[3] * amplitude + rotation)
      const y2 = y + radius * Math.sin(angle[3] * amplitude + rotation)
      const cpx1 = x - radius3 * Math.cos(angle[1] * amplitude * 2)
      const cpy1 = y - radius3 * Math.sin(angle[1] * amplitude * 2)
      const cpx2 = x + radius3 * Math.cos(angle[2] * amplitude * 2)
      const cpy2 = y + radius3 * Math.sin(angle[2] * amplitude * 2)

      ctx.strokeStyle = line.color

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2)
      ctx.stroke()
    })
  }
}

class Line {
  constructor(Wave, color) {
    const angle = Wave.angle
    const speed = Wave.speed

    this.angle = [
      Math.sin((angle[0] += speed[0])),
      Math.sin((angle[1] += speed[1])),
      Math.sin((angle[2] += speed[2])),
      Math.sin((angle[3] += speed[3])),
    ]

    this.color = color
  }
}

function each(items, callback) {
  for (let i = 0; i < items.length; i++) {
    callback(items[i], i)
  }
}

function extend(options, defaults) {
  for (let key in options)
    if (defaults.hasOwnProperty(key)) defaults[key] = options[key]
  return defaults
}

function dtr(deg) {
  return (deg * pi) / 180
}

function rnd(a, b) {
  if (arguments.length == 1) return Math.random() * a
  return a + Math.random() * (b - a)
}

function rnd_sign() {
  return Math.random() > 0.5 ? 1 : -1
}

export { Waves }
