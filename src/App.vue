<script>
import display from './pages/display/display.vue'
import control from './pages/control/control.vue'

import { Form } from './factory/Form'
import { Waves } from './factory/waves'

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
      form: new Form(),
    }
  },
  mounted() {
    this.initCanvas()
  },
  methods: {
    initCanvas() {
      const waves = new Waves('#holder', {
        waves: 4,
        width: 100,
      })
      // 减少初始化性能消耗
      setImmediate(() => {
        waves.animate()
        waves.stop()

        setTimeout(() => {
          waves.animate()
        }, 300)
      })
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
  background-color: #ebf2ff;
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
