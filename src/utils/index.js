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
    required: true,
    rules: [],
    cols: 12,
    formCols: 12,
    disabled: false,
    //element
    error: 'error',
    showMessage: true,
    inlineMessage: true,
    prop: 'prop',
    labelWidth: '50px',

    options: [
      {
        text: 'text',
        value: 'value',
        name: 'name',
        disabled: false,
        //element
        border: true,
        size: 'medium',
        radioButton: false,
        textColor: 'blue',
        fill: 'yellow',
      },
    ],
  },
  //checkbox
  {
    is: 'checkbox',
    label: 'label',
    required: true,
    rules: [],
    cols: 12,
    formCols: 12,
    disabled: false,
  },
]
