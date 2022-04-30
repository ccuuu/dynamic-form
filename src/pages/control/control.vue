<script>
import UiControl from './ui-control.vue'
import JSONControl from './JSON-control.vue'

export default {
  name: 'control',
  render(_c) {
    const _this = this
    const createBasic = () => {
      return _c('div', [
        _c('el-row', { style: 'margin-bottom:16px;font-weight: bold;' }, [
          _c(
            'el-col',
            { props: { span: 3 }, style: 'line-height: 24px;width:60px' },
            'Model'
          ),
          _c('el-col', { props: { span: 5 } }, [
            _c('el-switch', {
              style: 'display: block;width:115px',
              props: {
                'active-color': '#13ce66',
                'inactive-color': '#409eff',
                'active-text': 'UI',
                'inactive-text': 'JSON',
                value: _this.controlModel,
              },
              on: {
                change: (e) => {
                  _this.controlModel = e
                },
              },
            }),
          ]),
        ]),
        ,
        _c('keep-alive', [
          _c('component', {
            props: {
              form: _this.form,
            },
            is: _this.controlModel ? 'ui-control' : 'JSON-control',
            on: {
              addElement: (e) => {
                _this.$emit('addElement', e)
              },
            },
          }),
        ]),
        _c(
          'el-button',
          {
            style: 'margin-top:20px',
            props: { type: 'primary' },
            on: { click: _this.onSubmit },
          },
          '立即生成'
        ),
      ])
    }
    return createBasic()
  },
  components: { UiControl, JSONControl },
  data() {
    return {
      controlModel: true,
    }
  },
  props: {
    form: {
      type: Object,
      required: true,
    },
  },
  methods: {
    onSubmit() {
      this.$emit('addElement', this.form)
    },
  },
}
</script>
<style scoped></style>
