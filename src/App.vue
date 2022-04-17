<script>
import display from './components/display.vue'
import control from './components/control.vue'

export default {
  name: 'App',
  render(_c) {
    const _this = this
    const createBasic = () => {
      return _c('div', { attrs: { id: 'app' } }, [
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
    }
  },
  methods: {
    addElement(e) {
      this.$refs.display && this.$refs.display.addElement(e)
    },
  },
}
</script>

<style></style>
