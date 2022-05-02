<script>
export default {
  render(_c) {
    const _this = this
    const {
      isInput,
      isTextArea,
      isSelect,
      isCheckBox,
      isRadio,
      isSwitch,
      isDate,
      constraints,
    } = this
    const createBasic = () => {
      return _c('div', {}, [
        _c(
          'transition-group',
          {
            props: {
              name: 'list-complete',
            },
            //使用animation hook会导致刷新时机混乱的问题
            // on: {
            //   afterLeave() {
            //     //当动画完成时，dom并未完成删除，因此不能立即调用刷新回调
            //     //需要在下一帧动画（或宏任务队列）等待执行
            //     requestAnimationFrame(() => {
            //       _this.$emit('macroTaskFinish')
            //     })
            //   },
            //   afterEnter() {
            //     console.log('afterEnter')
            //     requestAnimationFrame(() => {
            //       _this.$emit('macroTaskFinish')
            //     })
            //   },
            // },
          },
          [
            ...constraints.map((row, i) => {
              return _c(
                'el-row',
                {
                  class: [
                    'outer-row',
                    ' list-complete-item',
                    ' height-90',
                    {
                      'no-transition': row.noTransition,
                    },
                  ],
                  key: row.key,
                },
                [
                  _c(
                    'el-col',
                    {
                      class: 'content',
                      style: { height: '100%' },
                      props: { span: 23 },
                    },
                    [
                      _c(
                        'el-row',
                        {
                          style: {
                            height: '100%',
                          },
                          props: { span: 10 },
                          key: i,
                        },
                        [
                          ...row.map((item, index) => {
                            return _c(
                              'el-col',
                              {
                                style: {
                                  height: '100%',
                                  'border-top': '1px solid #d1e4ff',
                                  'border-bottom':
                                    i === constraints.length - 1
                                      ? '1px solid #d1e4ff'
                                      : '',
                                },
                                props: { span: item.columns },
                                key: item.dataKey || index,
                              },
                              [createContext(item, index)]
                            )
                          }),
                        ]
                      ),
                    ]
                  ),
                  _c(
                    'el-col',
                    {
                      class: 'button-col',
                      style: {
                        display: 'flex',
                        'flex-direction': 'column',
                        width: '20px',
                        'justify-content': 'space-between',
                        height: '90%',
                      },
                      props: { span: 1 },
                      nativeOn: {
                        // mouseup: _this.stopPropagation,
                      },
                    },
                    createActionSection(i)
                  ),
                ]
              )
            }),
          ]
        ),
      ])
    }
    const createActionSection = (index) => {
      return [
        _c(
          'el-button',
          {
            style: {
              height: '15%',
              'margin-left': '0',
              'line-height': '0',
              'line-height': '0',
              padding: '0',
              'padding-left': '6px',
              'padding-right': '6px',
            },
            props: {
              type: 'text',
            },
            on: {
              click() {
                _this.$emit('deleteRowHandler', index)
              },
            },
          },
          [
            _c('p', {
              class: 'el-icon-delete',
              style: 'font-size: 1px;',
            }),
          ]
        ),
        _c(
          'el-button',
          {
            style: {
              height: '50%',
              'padding-left': '6px',
              'margin-left': '0',
              'padding-right': '6px',
            },
            on: {
              click: () => {
                this.$emit('newColHandler', index)
              },
            },
          },
          '+'
        ),
        _c(
          'el-button',
          {
            style: {
              height: '12%',
              'margin-left': '0',
              'line-height': '0',
              'line-height': '0',
              padding: '0',
              'padding-left': '6px',
              'padding-right': '6px',
            },
            on: {
              click: () => {
                this.$emit('newRowHandler', index)
              },
            },
          },
          '+'
        ),
      ]
    }
    const createContext = (item, index) => {
      return _c(
        'div',
        {
          key: item.forceUpdate,
          class: [
            { 'no-left-border': index > 0 },
            'item-border',
            'context-box',
          ],
          style: { position: 'relative', width: '100%', height: '100%' },
        },
        item.formType ? [createFormItem(item, index)] : null
      )
    }
    const createFormItem = (item, index) => {
      return _c(
        'el-form-item',
        {
          style: { 'margin-left': '6px', 'margin-right': '6px' },
          props: { label: item.label },
        },
        [createItemBasic(item, index)]
      )
    }
    const createItemBasic = (item, index) => {
      return isInput(item)
        ? createInput(item)
        : isTextArea(item)
        ? createTextArea(item)
        : isSelect(item)
        ? createSelect(item)
        : isCheckBox(item)
        ? createCheckBox(item)
        : isRadio(item)
        ? createRadio(item)
        : isSwitch(item)
        ? createSwitch(item)
        : isDate(item)
        ? createDate(item)
        : null
    }
    const createInput = (item) => {
      return _c('el-input')
    }
    const createTextArea = (item) => {
      return _c('el-input', {
        attrs: {
          type: 'textarea',
        },
      })
    }
    const createSelect = (item) => {
      return _c('el-input', { props: { 'suffix-icon': 'el-icon-arrow-down' } })
    }
    const createCheckBox = (item) => {
      return _c('el-checkbox', {})
    }
    const createRadio = (item) => {
      return _c('el-radio')
    }
    const createSwitch = (item) => {
      return _c('el-switch')
    }
    const createDate = (item) => {
      return _c('el-input', { props: { 'prefix-icon': 'el-icon-date' } })
    }
    return createBasic()
  },
  data() {
    return {
      virtualModel: '',
    }
  },
  props: {
    constraints: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  methods: {
    isInput(e) {
      return e.formType === 'input'
    },
    isTextArea(e) {
      return e.formType === 'textArea'
    },
    isSelect(e) {
      return e.formType === 'select'
    },
    isCheckBox(e) {
      return e.formType === 'checkBox'
    },
    isRadio(e) {
      return e.formType === 'radio'
    },
    isSwitch(e) {
      return e.formType === 'switch'
    },
    isDate(e) {
      return e.formType === 'date'
    },
    stopPropagation(e) {
      e.stopPropagation()
    },
  },
}
</script>
<style scoped>
.height-90 {
  height: 90px;
}
.item-border {
  border-left: 1px solid #d1e4ff;
  border-right: 1px solid #d1e4ff;
}
.no-left-border {
  border-left: none;
}
.list-complete-item {
  transition: 0.3s;
}
.list-complete-enter, .list-complete-leave-to
/* .list-complete-leave-active for below version 2.1.8 */ {
  opacity: 0;
  height: 0px;
  z-index: -1;
}
.no-transition {
  transition: 0s;
}
</style>
