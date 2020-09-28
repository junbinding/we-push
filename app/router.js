'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  // 微信回调
  router.all('/wx/notify', controller.home.notify);

  // 获取登录绑定状态
  router.get('/queryLoginStatus', controller.home.queryLoginStatus);

};
