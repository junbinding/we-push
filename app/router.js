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

  // 获取用户的默认 Topic
  router.get('/queryUserDefaultTopic', controller.home.queryUserDefaultTopic);

  // 推送消息
  router.get('/send', controller.home.send);
  router.post('/send', controller.home.send);

  // 获取推送消息详情
  router.get('/topicPubDetail', controller.home.topicPubDetail);
};
