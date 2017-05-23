export default {
  description: 'Test if two or more values are not equal',
  usage: ['value.ne(value[, value, ...]) → bool'],
  example: {
    description: 'Check if 2 values are not equal',
    code: `v.expr({ value: 1 }).ne({ value: 2 })`
  }
}

