/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1601254738004_8045';

  // add your middleware config here
  config.middleware = [];

  // 安全配置
  config.security = {
    csrf: {
      ignoreJSON: true,
    },
  };

  // 微信配置
  config.wechat = {
    appid: 'wx6b49cff143ce2371',
    appsecret: '39a81b8876349066c1001e68ddcd3901',
    token: '76f252ff44508b5c7028526978dc37e4',
    encodingAESKey: 'ZhgHzjvrYfhrYJmaoglW8gEzBiKckP53fWfrK2VgAWA',
    checkSignature: true,
    pushKey: 'wx_push_',
    pushTtl: 48 * 3600,
    templateWarning: 'gcqFueEFJyXjhdzNyGkzdNkcsWsKQfyIDAG6f1wuLe4',
  };

  // 日志配置
  config.logger = {
    outputJSON: true,
  };

  return {
    ...config,
  };
};
