'use strict';

class CommonError extends Error {
  constructor(message, code = 0, options = {}) {
    super(message);

    this.code = code;
    for (const [ key, value ] of Object.entries(options)) {
      this[key] = value;
    }
  }

  get name() {
    return this.constructor.name;
  }
}

// 参数校验错误
CommonError.PARAMS_ERROR = 100001;


module.exports = CommonError;
