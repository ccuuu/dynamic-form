<script>
import { Constraints } from '../../factory/create-constraints'
import { FormType } from '../../utils/Enum'

export default {
  render(_c) {
    const _this = this
    const { constraints } = this
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
        item.formType
          ? [
              FormType[formatText(item.formType)] === FormType.SlotScope
                ? generate.createSlotScope()
                : createFormItem(item, index),
            ]
          : null
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
      const fn = createGenerate(item.formType)
      if (typeof fn !== 'function') return
      return fn(item)
    }

    const generate = {
      createInput: (item) => {
        return _c('el-input')
      },
      createTextarea: (item) => {
        return _c('el-input', {
          class: 'display__textarea',
          attrs: {
            type: 'textarea',
          },
        })
      },
      createSelect: (item) => {
        return _c('el-input', {
          props: { 'suffix-icon': 'el-icon-arrow-down' },
        })
      },
      createCheckbox: (item) => {
        return (item.options || []).map((option) =>
          _c('el-checkbox', { props: { value: '1' } }, option.text)
        )
      },
      createRadio: (item) => {
        return (item.options || []).map((option) =>
          _c('el-radio', { props: { value: '1' } }, option.text)
        )
      },
      createSwitch: (item) => {
        return _c('el-switch')
      },
      createDate: (item) => {
        return _c('el-input', { props: { 'prefix-icon': 'el-icon-date' } })
      },
      createCascader: (item) => {
        return _c('el-input', {
          props: { 'suffix-icon': 'el-icon-arrow-down' },
        })
      },
      createTimePicker: (item) => {
        return _c('el-input', { props: { 'prefix-icon': 'el-icon-time' } })
      },
      createDateTimePiker: (item) => {
        return _c('el-input', { props: { 'prefix-icon': 'el-icon-time' } })
      },
      createSlider: (item) => {
        return _c('div', { class: 'el-slider' }, [
          _c('div', { class: 'el-slider__runway' }, [
            _c('div', {
              class: 'el-slider__bar',
              style: 'width: 40%; left: 0%;',
            }),
            _c(
              'div',
              { class: 'el-slider__button-wrapper', style: 'left:40%;' },
              [_c('div', { class: 'el-tooltip el-slider__button' })]
            ),
          ]),
        ])
      },
      createSlotScope: () => {
        return _c(
          'div',
          {
            class: 'el-slot-scope',
            style:
              'display:flex;flex-direction:column;height:70px;justify-content:space-between;padding-top:20px',
          },
          [
            _c(
              'div',
              {
                style: `width:50%;`,
                class: 'slot-scope-skeleton',
              },
              [
                _c(
                  'span',
                  {
                    class: 'slot-scope-font',
                  },
                  'SlotScope'
                ),
              ]
            ),
            _c('div', {
              style: 'width:100%;',
              class: 'slot-scope-skeleton',
            }),
            _c('div', {
              style: 'width:100%;',
              class: 'slot-scope-skeleton',
            }),
          ]
        )
      },
      createUpload: () => {
        return _c(
          'div',
          {
            class: 'el-upload el-upload--picture-card display__upload',
            style: 'width: 100%; height: 54px;line-height: 59px;',
          },
          [
            _c('i', { class: 'el-icon-plus' }),
            _c('input', {
              class: 'el-upload__input',
              attrs: { type: 'file', name: 'file' },
              on: {
                click(e) {
                  e.preventDefault()
                  e.stopPropagation()
                },
              },
            }),
          ]
        )
      },
    }
    const formatText = (text, additional = (text) => text) => {
      return additional(
        text.replace(/^\w|-\w/g, (w) => w.toUpperCase().replace('-', ''))
      )
    }
    function createGenerate(text) {
      const current = generate[formatText(text, (text) => `create${text}`)]
      return current
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
    stopPropagation(e) {
      e.stopPropagation()
    },
  },
}
</script>
<style lang="scss">
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
.slot-scope-skeleton {
  height: 12px;
  border-radius: 4px;
  background: #bdcdf1;
}
.slot-scope-font {
  font-size: 10px;
  color: gray;
  transform: translate(4px, -8px);
  display: inline-block;
}
.display__textarea {
  max-height: 55px;
  transform: translate(0, -15px);
}
.display__upload {
  transform: translate(0, -15px);
}
</style>
