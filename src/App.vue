<script>
import display from './pages/display.vue'
import control from './pages/control.vue'

export default {
  name: 'App',
  render(_c) {
    const _this = this
    const createCanvas = () => {
      return _c('div', { attrs: { id: 'holder' } })
    }
    const createBasic = () => {
      return _c('div', { attrs: { id: 'app' } }, [
        createCanvas(),

        _c('el-row', [
          createCol(
            12,
            _c('display', { ref: 'display', props: { form: _this.form } })
          ),
          createCol(3, _c('div', { style: 'height:80px' })),
          createCol(
            9,
            _c('control', {
              props: { form: _this.form },
              on: {
                addElement: _this.addElement,
              },
            })
          ),
        ]),
      ])
    }
    const createCol = (md, child) => {
      return _c('el-col', { props: { md } }, [child])
    }

    return createBasic()
  },
  components: { display, control },
  data() {
    return {
      baseData: null,
      form: {
        label: 'default a label',
        labelLeft: null,
        labelRight: null,
        formType: null,
      },
      Waves: null,
    }
  },
  created() {
    this.clientWidth = document.body.clientWidth
    this.clientHeight = document.body.clientHeight
    window.onresize = () => {
      this.clientWidth = document.body.clientWidth
      this.clientHeight = document.body.clientHeight
    }
  },
  mounted() {
    this.initCanvas()
  },
  methods: {
    addElement(e) {
      this.$refs.display && this.$refs.display.addElement(e)
    },
    initCanvas() {
      var pi = Math.PI
      var pi2 = 2 * Math.PI

      function Waves(holder, options) {
        this.options = extend(options || {}, {
          resize: false,
          rotation: 45,
          waves: 5,
          width: 200,
          hue: [11, 14],
          amplitude: 0.5,
          background: true,
          preload: true,
          speed: [0.002, 0.004],
          debug: false,
        })

        this.waves = []

        this.holder = document.querySelector(holder)
        this.canvas = document.createElement('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.holder.appendChild(this.canvas)

        this.hue = this.options.hue[0]
        this.hueFw = true
        this.stats = new Stats()

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

      Waves.prototype.init = function(preload) {
        var options = this.options

        for (var i = 0; i < options.waves; i++) this.waves[i] = new Wave(this)

        if (preload) this.preload()
      }

      Waves.prototype.preload = function() {
        var options = this.options

        for (var i = 0; i < options.waves; i++) {
          this.updateColor()
          for (var j = 0; j < options.width; j++) {
            this.waves[i].update()
          }
        }
      }

      Waves.prototype.render = function() {
        var ctx = this.ctx

        this.updateColor()
        this.clear()

        if (this.options.debug) {
          ctx.beginPath()
          ctx.strokeStyle = '#f00'
          ctx.arc(this.centerX, this.centerY, this.radius, 0, pi2)
          ctx.stroke()
        }

        if (this.options.background) {
          this.background()
        }

        each(this.waves, function(wave, i) {
          wave.update()
          wave.draw()
        })
      }

      Waves.prototype.animate = function() {
        this.render()

        window.requestAnimationFrame(this.animate.bind(this))
      }

      Waves.prototype.clear = function() {
        this.ctx.clearRect(0, 0, this.width, this.height)
      }

      Waves.prototype.background = function() {
        var ctx = this.ctx

        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, this.width, this.height)
      }

      Waves.prototype.resize = function() {
        var width = this.holder.offsetWidth
        var height = this.holder.offsetHeight
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

      Waves.prototype.updateColor = function() {
        this.hue += this.hueFw ? 0.01 : -0.01

        if (this.hue > this.options.hue[1] && this.hueFw) {
          this.hue = this.options.hue[1]
          this.Waves = false
        } else if (this.hue < this.options.hue[0] && !this.hueFw) {
          this.hue = this.options.hue[0]
          this.Waves = true
        }

        var a = Math.floor(127 * Math.sin(0.3 * this.hue + 0) + 128)
        var b = Math.floor(127 * Math.sin(0.3 * this.hue + 2) + 128)
        var c = Math.floor(127 * Math.sin(0.3 * this.hue + 4) + 128)

        this.color = 'rgba(' + a + ',' + b + ',' + c + ', 0.1)'
      }

      function Wave(Waves) {
        var speed = Waves.options.speed

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

      Wave.prototype.update = function() {
        var Lines = this.Lines
        var color = this.Waves.color

        Lines.push(new Line(this, color))

        if (Lines.length > this.Waves.options.width) {
          Lines.shift()
        }
      }

      Wave.prototype.draw = function() {
        var Waves = this.Waves

        var ctx = Waves.ctx
        var radius = Waves.radius
        var radius3 = radius / 3
        var x = Waves.centerX
        var y = Waves.centerY
        var rotation = dtr(Waves.options.rotation)
        var amplitude = Waves.options.amplitude
        var debug = Waves.options.debug

        var Lines = this.Lines

        each(Lines, function(line, i) {
          if (debug && i > 0) return

          var angle = line.angle

          var x1 = x - radius * Math.cos(angle[0] * amplitude + rotation)
          var y1 = y - radius * Math.sin(angle[0] * amplitude + rotation)
          var x2 = x + radius * Math.cos(angle[3] * amplitude + rotation)
          var y2 = y + radius * Math.sin(angle[3] * amplitude + rotation)
          var cpx1 = x - radius3 * Math.cos(angle[1] * amplitude * 2)
          var cpy1 = y - radius3 * Math.sin(angle[1] * amplitude * 2)
          var cpx2 = x + radius3 * Math.cos(angle[2] * amplitude * 2)
          var cpy2 = y + radius3 * Math.sin(angle[2] * amplitude * 2)

          ctx.strokeStyle = debug ? '#fff' : line.color

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2)
          ctx.stroke()

          if (debug) {
            ctx.strokeStyle = '#fff'
            ctx.globalAlpha = 0.3

            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(cpx1, cpy1)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(x2, y2)
            ctx.lineTo(cpx2, cpy2)
            ctx.stroke()

            ctx.globalAlpha = 1
          }
        })
      }

      function Line(Wave, color) {
        var angle = Wave.angle
        var speed = Wave.speed

        this.angle = [
          Math.sin((angle[0] += speed[0])),
          Math.sin((angle[1] += speed[1])),
          Math.sin((angle[2] += speed[2])),
          Math.sin((angle[3] += speed[3])),
        ]

        this.color = color
      }

      function Stats() {
        this.data = []
      }

      Stats.prototype.time = function() {
        return (performance || Date).now()
      }

      Stats.prototype.log = function() {
        if (!this.last) {
          this.last = this.time()
          return 0
        }

        this.new = this.time()
        this.delta = this.new - this.last
        this.last = this.new

        this.data.push(this.delta)
        if (this.data.length > 10) this.data.shift()
      }

      function each(items, callback) {
        for (var i = 0; i < items.length; i++) {
          callback(items[i], i)
        }
      }

      function extend(options, defaults) {
        for (var key in options)
          if (defaults.hasOwnProperty(key)) defaults[key] = options[key]
        return defaults
      }

      function dtr(deg) {
        return (deg * pi) / 180
      }

      function rtd(rad) {
        return (rad * 180) / pi
      }

      function diagonal_angle(w, h) {
        var a = Math.atan2(h, w) * 1.27325
        return a
      }

      function rnd(a, b) {
        if (arguments.length == 1) return Math.random() * a
        return a + Math.random() * (b - a)
      }

      function rnd_sign() {
        return Math.random() > 0.5 ? 1 : -1
      }

      var waves = new Waves('#holder', {
        waves: 2,
        width: 500,
      })

      waves.animate()
    },
  },
}
</script>

<style>
html,
body {
  width: 100%;
  /* height: 100%; */
  margin: 0;
  padding: 0;
  background-color: #eafafb;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#holder {
  position: fixed;
  opacity: 0.1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
