<script>
import options from './options.vue'

const isFull = false
const sizeOptions = ['medium', 'small', 'mini']
export default {
  name: 'radioCollector',
  components: {
    options,
  },
  render(_c) {
    const _this = this
    const createBasic = () => {
      return _c('div', [
        isFull ? createFullCollector() : null,
        !isFull
          ? _c(
              'div',
              { style: 'z-index:10' },

              [
                _c(
                  'el-button',
                  {
                    style:
                      'margin-bottom:10px;margin-bottom: 10px;position: absolute;right: 0;z-index: 1;',
                    props: { style: 'z-index:10', round: true, size: 'mini' },
                    on: {
                      click() {
                        _this.addOption()
                      },
                    },
                  },
                  '+options'
                ),
              ]
            )
          : null,
        _c('options', {
          props: {
            options: _this.uniqueInfo.options,
            tabIndex: _this.tabIndex,
          },
        }),
      ])
    }
    const createFullCollector = () => {
      return _c('el-form', { props: { model: _this.uniqueInfo } }, [
        _c('el-row', { props: { type: 'flex', justify: 'start' } }, [
          createCol(
            6,
            createFormItem(
              'border:',
              _c('el-switch', {
                props: {
                  value: _this.uniqueInfo.border,
                },
                on: {
                  change(val) {
                    _this.uniqueInfo.border = val
                  },
                },
              })
            )
          ),
          createCol(
            8,
            createFormItem(
              'radioButton:',
              '100px',
              _c('el-switch', {
                props: {
                  value: _this.uniqueInfo.radioButton,
                },
                on: {
                  change(val) {
                    _this.uniqueInfo.radioButton = val
                  },
                },
              })
            )
          ),
          createCol(
            10,
            createFormItem(
              'size:',
              _c(
                'el-select',
                {
                  style: 'width:100%',
                  props: {
                    value: _this.uniqueInfo.size,
                  },
                  on: {
                    change(val) {
                      _this.uniqueInfo.size = val
                    },
                  },
                },
                sizeOptions.map((option, index) =>
                  _c('el-option', {
                    key: `size_option_${index}`,
                    props: { value: option, label: option },
                  })
                )
              )
            )
          ),
        ]),
        ,
        _c(
          'el-row',
          {
            style: 'height:60px',
            props: { type: 'flex', justify: 'space-between' },
          },
          [
            createCol(
              7,
              createFormItem(
                'textColor:',
                '78px',
                _c('el-color-picker', {
                  props: {
                    value: _this.uniqueInfo.textColor,
                  },
                  on: {
                    change(val) {
                      _this.uniqueInfo.textColor = val
                    },
                  },
                })
              )
            ),
            createCol(
              7,
              createFormItem(
                'fill:',
                _c('el-color-picker', {
                  props: {
                    value: _this.uniqueInfo.fill,
                  },
                  on: {
                    change(val) {
                      _this.uniqueInfo.fill = val
                    },
                  },
                })
              )
            ),
            createCol(
              6,
              _c(
                'el-button',
                {
                  style: 'margin-bottom:10px',
                  props: { round: true, size: '' },
                  on: {
                    click() {
                      _this.addOption()
                    },
                  },
                },
                '+options'
              )
            ),
          ]
        ),
      ])
    }
    const createCol = (span, children) => {
      return _c(
        'el-col',
        { props: { span } },
        Array.isArray(children) ? children : [children]
      )
    }
    const createFormItem = (label, ...args) => {
      const children = args[args.length - 1]
      const labelWidth = args.length > 1 ? args[0] : '60px'
      return _c(
        'el-form-item',
        { props: { label, props: label, labelWidth } },
        Array.isArray(children) ? children : [children]
      )
    }
    return createBasic()
  },
  data() {
    return {
      tabIndex: '0',
    }
  },
  props: {
    uniqueInfo: {
      type: Object,
      require: true,
    },
  },
  methods: {
    addOption() {
      if (Number(this.tabIndex) >= 3) return
      this.tabIndex = this.tabIndex / 1 + 1 + ''

      this.uniqueInfo.options.push(this.genOption())
    },
    genOption() {
      const lastIndex = this.uniqueInfo.options[
        this.uniqueInfo.options.length - 1
      ].value.match(/\d+$/)[0]
      return {
        text: 'default',
        value: `options_${lastIndex / 1 + 1}`,
      }
    },
  },
}
</script>
