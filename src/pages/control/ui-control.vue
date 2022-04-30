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
            props: { model: _this.form, labelWidth: '90px' },
          },
          [createFormItem('Form label: ', createLabel())]
        ),

        CollectorEnum.hasOwnProperty(this.collectInfoElement)
          ? _c('keep-alive', [
              _c(CollectorEnum[_this.collectInfoElement], {
                ref: _this.collectInfoElement,
              }),
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
              const currentInfo = _this.$refs[_this.form.formType].uniqueInfo
              for (const [key, value] of Object.entries(currentInfo)) {
                _this.$set(_this.form, key, value)
              }
              console.log(_this.form)
            },
          },
        }),
      ])
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
}
</style>
