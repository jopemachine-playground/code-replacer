// Error when creating replacingObject with input like csv, template.
class CreatingReplacingObjError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

// Occurs when ${key} or $[key] is found that is not matched to the right term of the template
class InvalidRightReferenceError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

// Occurs when ${key} or $[key] is found that is not matched to the left term of the template
class InvalidLeftReferenceError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

class InvalidLeftTemplateError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

const ERROR_CONSTANT = {
  DUPLICATE_KEY: (duplicateKey) => `
Duplicate key exists in replaceObj.
Duplicate key: ${duplicateKey}

This might happens when..
1. You might use regular expression for the left template value, and there are more than two values matched to that regexp.
2. csv column Key is not replaced because is not valid.`,

  WRONG_COLUMN_R_Template: `
There are some columnName that does not exist in the right value of the template.

This might happens when..
1. There are some wrong named column variable (don't exists in the csv).
`,

  LEFT_TEMPLATE_EMPTY: `
It seems that left template value is empty.
See README.md for usage
`
}

module.exports = {
  CreatingReplacingObjError,
  InvalidLeftReferenceError,
  InvalidRightReferenceError,
  InvalidLeftTemplateError,
  ERROR_CONSTANT
}
