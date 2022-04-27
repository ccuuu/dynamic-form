export function cache(fn) {
  const caches = new WeakMap()
  return function(params, useCache = true) {
    if (!useCache) return fn(params)
    // console.log(
    //   'use cache: ',
    //   caches.has(params),
    //   params,
    //   fn(params),
    //   caches.get(params)
    // )
    return (caches.has(params) ? caches : caches.set(params, fn(params))).get(
      params
    )
  }
}

export const cloneDeep = (value) => {
  if (typeof value !== 'object') return value
  const result = value instanceof Array ? [] : {}
  const stack = [{ result, value }]
  while (stack.length > 0) {
    const { result, value } = stack.pop()
    if (!value) continue
    for (const [key, item] of Object.entries(value)) {
      if (typeof item !== 'object' || item instanceof Node) {
        result[key] = item
        continue
      }
      result[key] = item instanceof Array ? [] : {}
      stack.push({ result: result[key], value: item })
    }
  }
  return result
}
//is：指定表单项的类型
//label：表单的label
//required：是否必填
//rules：校验规则
//cols：所占宽度
//formCols：表单项的尺寸(基于当前行)，若不指定，则与cols同宽

//error：表单项验证的错误信息
//showMessage：是否显示校验错误信息
//inlineMessage：以行内形式展示校验信息
//prop：指定表单的prop，若不提供则使用dataKey作为prop
//labelWidth：label的宽度
const constraints = [
  //radio
  {
    is: 'radio',
    label: 'label',
    prop: 'prop',
    name: 'name',
    dataKey: 'key1',
    required: true,
    rules: [],
    cols: 12,
    formCols: 12,
    disabled: false,
    //element
    element: {
      error: 'error',
      showMessage: true,
      inlineMessage: true,
      labelWidth: '50px',
      border: true,
      size: 'medium',
      radioButton: false,
      textColor: 'blue',
      fill: 'yellow',
    },

    options: [
      {
        text: 'text',
        value: 'value',
        name: 'name',
        disabled: false,
      },
    ],
  },
  //checkbox
  {
    is: 'checkbox',
    label: 'label',
    prop: 'prop',
    name: 'name',
    dataKey: 'key1',
    required: true,
    rules: [],
    cols: 12,
    formCols: 12,
    disabled: false,
    //element
    element: {
      error: 'error',
      showMessage: true,
      inlineMessage: true,
      labelWidth: '50px',
      border: false,
      size: 'medium',
      min: 1,
      max: 4,
      textColor: 'blue',
      fill: 'yellow',
    },

    options: [
      {
        text: 'text',
        value: 'value',
        name: 'name',
        disabled: false,
      },
    ],
  },
  //input
  {
    is: 'input',
    label: 'label',
    prop: 'prop',
    dataKey: 'key1',
    name: 'name',
    required: true,
    rules: [],
    cols: 12,
    formCols: 12,
    disabled: false,

    type: 'text',
    maxlength: 1,
    minlength: 20,
    placeholder: '123',
    clearable: true,
    readonly: true,
    resize: '',
    autofocus: true,
    tabindex: 1,

    element: {
      showWordLimit: true,
      showPassword: true,
      size: 'medium',
      prefixIcon: '',
      suffixIcon: '',
      rows: '',
      autosize: true,
      autocomplete: true,
      validateEvent: true,
      prefix: '',
      suffix: '',
      prepend: '',
      append: '',
    },
  },
  //select
  {
    is: 'select',
    label: 'label',
    prop: 'prop',
    dataKey: 'key1',
    name: 'name',
    required: true,
    rules: [],
    cols: 12,
    formCols: 12,
    disabled: false,
    clearable: true,
    filterable: true,
    loading: false,

    element: {
      //默认为value
      valueKey: 'value',
      size: '',
      collapseTags: true,
      multipleLimit: true,
      autocomplete: 'off',
      allowCreate: true,
      filterMethod: function() {},
      remote: true,
      remoteMethod: function() {},
      loadingText: '12',
      noMatchText: '',
      noDataText: '',
      reserveKeyword: '',
      popperAppendToBody: false,
      automaticDropdown: true,
    },

    options: [
      {
        text: 'text',
        value: 'value',
        disabled: false,
      },
    ],
  },
  //switch
  {
    is: 'switch',
    label: 'label',
    prop: 'prop',
    name: 'name',
    dataKey: 'key1',
    required: true,
    rules: [],
    cols: 12,
    formCols: 12,
    disabled: false,

    element: {
      width: 120,
      activeIconClass: '',
      inactiveIconClass: '',
      activeText: '',
      inactiveText: '',
      activeValue: '',
      inactiveValue: '',
      activeColor: '',
      inactiveColor: '',
      validateEvent: false,
    },
  },

  //Cascader
  {
    is: 'cascader',
    label: 'label',
    prop: 'prop',
    dataKey: 'key1',
    name: 'name',
    required: true,
    rules: [],
    cols: 12,
    formCols: 12,
    disabled: false,
    placeholder: '',
    clearable: true,

    showAllLevels: true,
    collapseTags: true,
    separator: true,
    filterable: true,
    filterMethod: function() {},
    debounce: 500,
    beforeFilter() {},

    //element规则
    options: [],
  },

  //Slider 仅支持横向。竖向需要slot
  {
    is: 'slider',
    label: 'label',
    disabled: false,
    dataKey: 'key1',
    min: 1,
    max: 20,
    step: 1,
    showStops: true,
    showTooltip: true,
    formatTooltip() {},
    range: true,
    marks: {
      0: '0°C',
      8: '8°C',
      37: '37°C',
      50: {
        style: {
          color: '#1989FA',
        },
        // label: this.$createElement('strong', '50%'),
      },
    },
  },

  //timePicker
  {
    is: 'timePicker',
    name: '',
    readonly: false,
    disabled: false,
    editable: true,
    clearable: true,
    size: '',
    placeholder: '',
    startPlaceholder: '',
    endPlaceholder: '',
    isRange: true,
    arrowControl: true,
    align: '',
    pickerOptions: {
      start: '08:30',
      step: '00:15',
      end: '18:30',
      // minTime: startTime,
    },
    rangeSeparator: '',
    valueFormat: '',
    defaultValue: '',
    prefixIcon: '',
    clearIcon: '',
  },

  //datePicker
  {
    is: 'timePicker',
    name: '',
    readonly: false,
    disabled: false,
    editable: true,
    clearable: true,
    size: '',
    placeholder: '',
    startPlaceholder: '',
    endPlaceholder: '',
    type: '',
    format: '',
    align: '',
    pickerOptions: {
      start: '08:30',
      step: '00:15',
      end: '18:30',
      // minTime: startTime,
    },
    rangeSeparator: '',
    valueFormat: '',
    defaultValue: '',
    prefixIcon: '',
    clearIcon: '',
    validateEvent() {},
    unlinkPanels: true,
  },

  //dateTimepicker
  {
    is: 'dateTimepicker',
    name: '',
    readonly: false,
    disabled: false,
    editable: true,
    clearable: true,
    size: '',
    placeholder: '',
    startPlaceholder: '',
    endPlaceholder: '',
    timeArrowControl: '',
    type: '',
    format: '',
    align: '',
    pickerOptions: {
      start: '08:30',
      step: '00:15',
      end: '18:30',
      // minTime: startTime,
    },
    rangeSeparator: '',
    valueFormat: '',
    defaultValue: '',
    defaultTime: '',
    prefixIcon: '',
    clearIcon: '',
    unlinkPanels: true,
  },
]
