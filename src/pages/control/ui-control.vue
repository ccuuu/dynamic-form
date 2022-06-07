<script>
import DraggableSection from './draggable-section.vue'
import BasicInfoCollector from './form-information-collection/basic-info-collector.vue'

import {
  InputCollector,
  CheckboxCollector,
  SliderCollector,
  RadioCollector,
  SwitchCollector,
  TimePickerCollector,
  DateTimePickerCollector,
  UploadCollector,
  TextareaCollector,
  DateCollector,
  SelectCollector,
  CascaderCollector,
} from './form-information-collection/form-item-collector'
import { FormType } from '../../utils/Enum'
import { defaultUniqueInfo } from '../../factory/Form'
const CollectorEnum = {
  [FormType.Input]: 'input-collector',
  [FormType.Checkbox]: 'slider-collector',
  [FormType.Radio]: 'radio-collector',
  [FormType.Switch]: 'switch-collector',
  [FormType.TimePicker]: 'time-picker-collector',
  [FormType.DateTimePiker]: 'date-time-picker-collector',
  [FormType.Upload]: 'upload-collector',
  [FormType.TextArea]: 'textarea-collector',
  [FormType.Date]: 'date-collector',
  [FormType.Select]: 'select-collector',
  [FormType.Cascader]: 'cascader-collector',
}

export default {
  name: 'controls',
  components: {
    DraggableSection,
    BasicInfoCollector,
    InputCollector,
    CheckboxCollector,
    SliderCollector,
    RadioCollector,
    SwitchCollector,
    TimePickerCollector,
    DateTimePickerCollector,
    UploadCollector,
    TextareaCollector,
    DateCollector,
    SelectCollector,
    CascaderCollector,
  },
  render(_c) {
    const _this = this
    const createBasic = () => {
      return _c('div', { style: 'margin-right:8px' }, [
        _c(
          'el-form',
          {
            ref: 'form',
            props: {
              model: _this.form,
              labelWidth: '90px',
            },
          },
          [
            createRow([
              createCol(16, createFormItem('form label:', createLabel())),
              createCol(
                6,
                createFormItem(
                  'required:',
                  _c('el-switch', createModel('required'))
                )
              ),
            ]),
            createRow([
              createCol(
                8,
                createFormItem(
                  'dateKey:',
                  _c('el-input', createModel('dateKey', 'input'))
                )
              ),
              createCol(
                8,
                createFormItem(
                  'prop:',
                  _c('el-input', createModel('prop', 'input'))
                )
              ),
              createCol(
                8,
                createFormItem(
                  'name:',
                  _c('el-input', createModel('name', 'input'))
                )
              ),
            ]),
          ]
        ),
        //todo：提前收集表单项相关的一些信息。如何与form联系，待设计...
        // _c('div', { attrs: { id: 'collector-container' } }, [
        //   _c('div', {
        //     style: 'z-index:-10',
        //     attrs: { id: 'background-element' },
        //   }),
        //   _c(
        //     CollectorEnum[_this.collectFormType],
        //     {
        //       class: 'content-container',
        //       style: 'z-index:10;position:relative',
        //       props: { uniqueInfo: _this.collectInfo },
        //     },
        //     {
        //       ref: _this.collectFormType,
        //     }
        //   ),
        // ]),
        _c('draggable-section', {
          ref: 'draggableSection',
          props: {
            form: _this.form,
            collectInfo: _this.collectInfo,
            collectFormType: _this.collectFormType,
          },
          on: {
            resetCollectInfo() {
              _this.collectFormType = FormType.Input
            },
            resetCollectFormType(val) {
              _this.collectFormType = val
            },
          },
        }),
      ])
    }
    const createModel = (key, methods = 'change') => {
      return {
        props: {
          value: _this.form[key],
        },
        on: {
          [methods](val) {
            _this.$set(_this.form, key, val)
          },
        },
      }
    }
    const createRow = (children) => {
      return _c(
        'el-row',
        { props: { type: 'flex', justify: 'space-between' } },
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
    const createFormItem = (label, children) => {
      return _c(
        'el-form-item',
        { props: { label } },
        Array.isArray(children) ? children : [children]
      )
    }
    const createLabel = () => {
      return _c(
        'el-input',
        {
          class: 'input-with-select',
          props: { value: _this.form.label },
          on: {
            input(value) {
              _this.form.label = value
            },
          },
        },
        [
          _c('template', { slot: 'prepend' }, createLabelSide('labelLeft', [])),
          _c('template', { slot: 'append' }, createLabelSide('labelRight', [])),
        ]
      )
    }
    const createLabelSide = (dataKey, options) => {
      return [
        _this.form[dataKey]
          ? _c('div', [
              _c('i', { class: _this.form[dataKey] }),
              _c('i', {
                class: 'el-icon-close',
                style:
                  'margin-left:5px;display: inline-block;margin-right: -14px;',
                on: {
                  click() {
                    _this.form[dataKey] = null
                  },
                },
              }),
            ])
          : _c(
              'el-select',
              {
                props: { value: _this.form[dataKey] },
                on: {
                  change(e) {
                    _this.form[dataKey] = e.target.value
                  },
                },
              },
              options.map((option) =>
                _c('el-option', { attrs: { value: option } }, [
                  _c('i', { class: option }),
                ])
              )
            ),
      ]
    }

    return createBasic()
  },
  data() {
    return {
      collectInfo: {},
      collectFormType: FormType.Input,
    }
  },
  watch: {
    collectFormType(val) {
      this.collectInfo = defaultUniqueInfo(val)
    },
  },
  props: {
    form: {
      type: Object,
      required: true,
    },
  },
}
</script>
<style lang="scss">
.el-tabs__nav-wrap::after {
  display: none;
}

.el-tabs__item,
.el-tabs__nav-next,
.el-tabs__nav-prev {
  height: 32px;
  line-height: 32px;
  color: #919191;
}
#collector-container {
  padding: 3px;
  position: relative;
  margin: 35px;
  margin-bottom: 42px;
}

#collector-container .el-row {
  z-index: 5;
}
#collector-container::after,
#collector-container::before {
  content: '';
  border: 2px solid #b8c5ff45;
  opacity: 0.8;
  position: absolute;
  width: calc(100% + 60px);
  height: calc(100% + 40px);
  top: -21px;
  left: -31px;
  border-radius: 8px;
  z-index: 0;
}
#collector-container::after {
  animation: clipPath1 1.5s linear;
}
#collector-container::before {
  animation: clipPath2 1.5s linear;
}

@keyframes clipPath1 {
  0% {
    border: 2px solid #a0b5e7;

    clip-path: inset(98% 0 0 0);
  }
  25% {
    clip-path: inset(0 50% 0 50%);
  }
  50% {
    clip-path: inset(98% 0 0 0);
  }
  75% {
    clip-path: inset(50% 0 0 0);
  }
}
@keyframes clipPath2 {
  0% {
    border: 2px solid #a0b5e7;

    clip-path: inset(0 0 98% 0);
  }
  25% {
    clip-path: inset(0 50% 0 50%);
  }
  50% {
    clip-path: inset(0 0 98% 0);
  }
  75% {
    clip-path: inset(0 0 50% 0);
    border: 2px solid #abbde7;
  }
}
</style>
