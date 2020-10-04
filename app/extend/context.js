'use strict';

const { default: Schema } = require('async-validator');
const CommonError = require('../../app/error/commonError');


module.exports = {
  async verify(rules, params) {
    const validator = new Schema(rules);
    return new Promise((resolve, reject) => {
      validator.validate(params, errors => {
        if (errors) {
          this.logger.info(`路径：${this.request.path} 请求入参校验失败, rules: %j, params: %j`, rules, params);
          reject(new CommonError(errors[0].message, CommonError.PARAMS_ERROR));
          return;
        }

        this.logger.info(`路径：${this.request.path} 请求入参校验成功`);
        resolve();
      });
    });
  },
};
