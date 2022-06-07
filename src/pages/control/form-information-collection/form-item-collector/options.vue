<script>
export default {
  render(_c) {
    const _this = this

    const createBasic = () => {
      return _c(
        'el-tabs',
        {
          style: 'height:88px',
          props: { value: _this.tabIndex, tabPosition: 'top', closable: true },
          on: {
            'tab-remove'(val) {
              _this.options.splice(val, 1)
            },
          },
        },
        _this.options.map((option, index) =>
          _c(
            'el-tab-pane',
            { key: index, props: { label: option.text, name: index + '' } },
            createOptionCollector(option)
          )
        )
      )
    }
    const createOptionCollector = (option) => {
      return [
        _c('el-form', { props: { model: option } }, [
          _c('el-row', { props: { type: 'flex', justify: 'space-between' } }, [
            ...['text', 'value'].map((item) => {
              return createCol(8, [
                createFormItem(
                  `${item}:`,
                  '50px',
                  _c('el-input', {
                    props: {
                      value: option[item],
                    },
                    on: {
                      input(val) {
                        _this.$set(option, item, val)
                      },
                    },
                  })
                ),
              ])
            }),
            createCol(6, [
              createFormItem(
                `disabled:`,
                '70px',
                _c('el-switch', {
                  props: {
                    value: option.disabled,
                  },
                  on: {
                    change(val) {
                      _this.$set(option, 'disabled', val)
                    },
                  },
                })
              ),
            ]),
          ]),
        ]),
      ]
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
    const createCol = (span, children) => {
      return _c(
        'el-col',
        { props: { span } },
        Array.isArray(children) ? children : [children]
      )
    }
    return createBasic()
  },
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    tabIndex: {
      type: String,
      required: true,
    },
  },
}
</script>
<style>
.el-tabs__nav-wrap {
  width: calc(100% - 100px) !important;
}
</style>
