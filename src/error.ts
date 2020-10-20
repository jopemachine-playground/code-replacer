// Error when creating replacingObject with input like csv, template.
class CreatingReplacingObjError extends Error {
  constructor (message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Occurs when ${key} or $[key] is found that is not matched to the right term of the template
class InvalidRightReferenceError extends Error {
  constructor (message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Occurs when ${key} or $[key] is found that is not matched to the left term of the template
class InvalidLeftReferenceError extends Error {
  constructor (message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class InvalidLeftTemplateError extends Error {
  constructor (message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class CSVParsingError extends Error {
  constructor (message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Occurs when there is no key in the left term of the template and csv is not an empty array
class TemplateHasNoKeyError extends Error {
  constructor (message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

const ERROR_CONSTANT = {
  DUPLICATE_KEY: (key: string, value: string) => `
Duplicate key exists in replaceObj.
duplicated key: ${key}
duplicated value: ${value}

This might happens why..
1. You might use regular expression for the left template value, and there are more than two values matched to that regexp.
2. csv column Key is not replaced because is not valid.
3. there are more than one matching csv column key in the left side of the template in csv.
`,

  WRONG_COLUMN_R_Template: `
There are some columnName that does not exist in the right value of the template.

This might happens why..
1. There are some wrong named column variable (don't exists in the csv).
`,

  LEFT_TEMPLATE_EMPTY: `
It seems that left template value is empty.
See README.md for usage
`,

  NON_EXISTENT_GROUPKEY: `
This might happens why..
1. You might use $[key] that do not exist at the right term of template.
`
};

export {
  CreatingReplacingObjError,
  InvalidLeftReferenceError,
  InvalidRightReferenceError,
  InvalidLeftTemplateError,
  CSVParsingError,
  TemplateHasNoKeyError,
  ERROR_CONSTANT
};
