'use strict';

const Service = require('egg').Service;

class WechatService extends Service {
  // 处理微信通知事件
  async handle(event) {
    if (event.Event === 'SCAN') {
      return await this.handleScan(event);
    } else if (event.MsgType === 'text') {
      return await this.handleText(event);
    } else if (event.Event === 'subscribe') {
      if (event.EventKey.indexOf('qrscene_') === 0) {
        return await this.handleScan(event);
      }
    }
  }

  // 处理订阅号文本输入
  async handleText(event) {
    if (event.Content === '中国理财数据') {
      return await this.app.redis.get('LICAI_LATEST_CSV');
    }

    return event.Content;
  }

  // 处理微信扫描事件
  async handleScan(event) {
    const loginKey = 'LOGIN:';
    if (event.EventKey.indexOf(loginKey) >= 0) {
      return await this.onLoginEvent(event);
    }

    return '';
  }

  // 处理登录信息
  async onLoginEvent(event) {
    const { app } = this;
    console.log(event);
    const loginKey = 'LOGIN:';
    this.wechatUserRegister({
      openid: event.FromUserName,
    });
    const firstLoginKey = event.EventKey.slice(event.EventKey.indexOf(loginKey) + loginKey.length);
    const redisKey = `${app.config.wechat.loginKey}${firstLoginKey}`;
    const redisValue = await app.redis.get(redisKey);
    if (redisValue) {
      return '登录二维码已失效，请重新登录';
    }
    app.redis.set(`${app.config.wechat.loginKey}${firstLoginKey}`, event.FromUserName, 'EX', 3600);
    return '欢迎登录个金生活家!';
  }

  // 微信用户注册
  async wechatUserRegister(info = {}) {
    const { ctx, logger } = this;
    logger.info('微信用户注册 info:  %j', info);
    const [ user ] = await ctx.model.User.findOrCreate({
      where: {
        openid: info.openid,
      },
      defaults: info,
    });

    logger.info('微信用户注册 user:  %j', user);

    // 给用户默认创建一个个人Topic
    try {
      const topic = await ctx.service.topic.findSingleOrCreateByUser({
        user_id: user.id,
      });

      logger.info('微信用户注册 topic %j', topic);
    } catch (e) {
      logger.error(e);
    }

    return user;
  }
}

module.exports = WechatService;
