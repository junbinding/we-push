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

  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.html': 'nunjucks',
    },
  };

  // 安全配置
  config.security = {
    csrf: {
      enable: false,
    },
  };

  // 静态资源
  config.static = {
    prefix: '/',
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
    loginKey: 'LOGIN_QRKEY_',
  };

  // 日志配置
  config.logger = {
    outputJSON: true,
  };

  const userConfig = {
    domain: 'https://d.frp.ik47.com',
    qrlink: 'https://wenhairu.com/static/api/qr/?size=300&text=',
  };

  // redis
  config.redis = {
    Redis: require('ioredis'),
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: ',NodeTutorial!Redis',
      db: 0,
    },
  };

  config.sequelize = {
    dialect: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: ',NodeTutorial!Mysql',
    database: 'tutorial',
    timezone: '+08:00',
    dialectOptions: {
      dateStrings: true,
      typeCast(field, next) { // for reading from database
        if (field.type === 'DATETIME') {
          return field.string();
        }
        return next();
      },
    },
    define: {
      underscored: true,
      freezeTableName: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  };

  exports.session = {
    key: 'EGG_SESS',
    maxAge: 24 * 3600 * 1000 * 7, // 1 天
    httpOnly: true,
    encrypt: true,
  };

  return {
    ...config,
    ...userConfig,
  };
};
