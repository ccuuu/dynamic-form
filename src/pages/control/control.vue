<script>
import UiControl from './ui-control.vue'
import JSONControl from './JSON-control.vue'

export default {
  name: 'control',
  render(_c) {
    const _this = this
    const createBasic = () => {
      return _c('div', { style: 'padding-right: 8px;' }, [
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
                disabled:true
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
          }),
        ]),
        _c(
          'el-button',
          {
            style: 'margin-top:20px',
            attrs: { id: 'export-button' },
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
  methods:{
    onSubmit(){}
  }
}
</script>
<style scoped>
#export-button {
  background-color: #fff0;
  border-radius: 6px;

  /* height: 40px;
  width: 100px; */
  border: none;
  position: relative;
  overflow: hidden;
}
#export-button::before {
  content: '立即生成';
  line-height: 28px;
  width: 86px;
  height: 28px;
  background-color: #9cb3e7;
  border-color: #bdcdf1;
  border-radius: 4px;
  position: absolute;
  z-index: 10;
  top: 5px;
  left: 5px;
  transition: all 0.4s;
}
#export-button::after {
  content: '';
  width: 118px;
  height: 58px;

  position: absolute;
  left: -10px;
  top: -10px;
  background-color: #bacaef;
  transform: rotate(-90deg);
  transform-origin: left bottom;
  transition: all 0.4s;
}
#export-button:hover::after {
  transform: rotateZ(0deg);
}
#export-button:hover::before {
  background-color: #bacaef !important;
}
</style>
