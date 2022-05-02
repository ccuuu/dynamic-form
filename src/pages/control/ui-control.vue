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
const CollectorEnum = {
  input: 'input-collector',
  slider: 'slider-collector',
  radio: 'radio-collector',
  switch: 'switch-collector',
  'time-picker': 'time-picker-collector',
  'date-time-picker': 'date-time-picker-collector',
  upload: 'upload-collector',
  textarea: 'textarea-collector',
  date: 'date-collector',
  select: 'select-collector',
  cascader: 'cascader-collector',
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
        CollectorEnum.hasOwnProperty(this.collectInfoElement)
          ? _c('div', { attrs: { id: 'collector-container' } }, [
              _c('div', { attrs: { id: 'background-element' } }),
              _c(
                CollectorEnum[_this.collectInfoElement],
                { class: 'content-container' },
                {
                  ref: _this.collectInfoElement,
                }
              ),
            ])
          : null,
        _c('draggable-section', {
          props: {
            collectInfoElement: _this.collectInfoElement,
            form: _this.form,
          },
          on: {
            'update:collectInfoElement'(val) {
              _this.collectInfoElement = val
            },
            addElement(e) {
              _this.$emit('addElement', e)
            },
            updateFormInfo() {
              const currentInfo = _this.$refs[_this.form.formType]
                ? _this.$refs[_this.form.formType].uniqueInfo
                : {}
              for (const [key, value] of Object.entries(currentInfo)) {
                _this.$set(_this.form, key, value)
              }
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
      collectInfoElement: null,
    }
  },
  watch: {
    collectInfoElement(val) {
      console.log(val)
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
<style>
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
#background-element {
  opacity: 0.6;
  position: absolute;
  width: calc(100% + 48px);
  height: calc(100% + 28px);
  top: -12px;
  left: -22px;
  border-radius: 8px;
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
