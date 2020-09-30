'use strict';

const WechatAPI = require('co-wechat-api');
const Wechat = require('co-wechat');
const OAuth = require('co-wechat-oauth');

module.exports = app => {
  // 初始化微信配置
  const wechatConfig = app.config.wechat;
  const oauthApi = new OAuth(wechatConfig.appid, wechatConfig.appsecret, async function(openid) {
    const txt = await app.redis.get('wechat_token_' + openid);
    return JSON.parse(txt);
  }, async function(openid, token) {
    await app.redis.set('wechat_token_' + openid, JSON.stringify(token), 'EX', 3600);
  });
  const api = new WechatAPI(wechatConfig.appid, wechatConfig.appsecret, async function(openid) {
    const txt = await app.redis.get('wechat_token_' + openid);
    return JSON.parse(txt);
  }, async function(openid, token) {
    await app.redis.set('wechat_token_' + openid, JSON.stringify(token), 'EX', 3600);
  });

  class HomeController extends app.Controller {
    async index() {
      const { ctx } = this;
      // 1. 判断是否有 session
      let loginCode = '';
      if (!ctx.session.user) {
        loginCode = ctx.service.crypto.md5(Date.now().toString() + Math.random());
        await ctx.render('web.html', {
          qrlink: await this.getQrcode(`LOGIN:${loginCode}`),
          loginCode,
        });
        return;
      }

      console.log(ctx.session.user);
      await ctx.render('web.html', {
        qrlink: await this.getQrcode(`LOGIN:${loginCode}`),
        loginCode,
        user: JSON.stringify(ctx.session.user),
      });
      return;
    }

    async send() {
      const { ctx } = this;
      const { title, code, content = '' } = { ...ctx.query, ...ctx.request.body };
      if (!title || !code) {
        ctx.body = {
          code: 1,
          msg: '参数校验错误',
        };
        return;
      }

      const topic = await ctx.model.Topic.findOne({
        where: {
          code,
        },
      });

      if (!topic) {
        ctx.body = {
          code: 1,
          msg: '非法请求',
        };
        return;
      }
      const pubLog = await ctx.model.TopicPubLog.create({
        topic_id: topic.id,
        title,
        content,
      });

      const user = await ctx.model.User.findOne({
        id: topic.user_id,
      });

      this.sendTemplate({
        pubId: pubLog.id,
        title,
        openid: user.openid,
        content: pubLog.content,
      });

      ctx.body = {
        code: 0,
        msg: '发送成功',
      };
    }

    // 获取用户的默认 Topic
    async queryUserDefaultTopic() {
      const { ctx } = this;
      const TopicModel = ctx.model.Topic;
      const user = ctx.session.user;
      const topic = await ctx.service.topic.findSingleOrCreateByUser({
        user_id: user.id,
        type: TopicModel.TYPE_SINGLE,
      });

      ctx.body = {
        code: 0,
        data: topic,
      };
    }

    // 轮训登录绑定状态
    async queryLoginStatus() {
      const { ctx, app } = this;
      const loginCode = ctx.query.loginCode;
      const openId = await app.redis.get(`${app.config.wechat.loginKey}${loginCode}`);
      if (!openId) {
        ctx.body = {
          code: 1,
          msg: '未找到用户登录绑定信息',
        };
        return;
      }

      const user = await ctx.model.User.findOne({
        where: {
          openid: openId,
        },
      });

      if (!user) {
        ctx.body = {
          code: 2,
          msg: '用户不存在',
        };
        return;
      }

      ctx.session.user = user;

      ctx.body = {
        code: 0,
        msg: '绑定成功',
        data: user,
      };
      return;
    }

    async getSign() {
      const { ctx } = this;
      ctx.body = 'success';
    }

    async hi() {
      const { ctx, app } = this;
      const url = encodeURIComponent(oauthApi.getAuthorizeURL(`${app.config.domain}/wx/oauth`, 'state', 'snsapi_userinfo'));
      ctx.body = `<img src="${app.config.qrlink}${url}"/>`;
    }

    async oauth() {
      const { ctx } = this;
      const token = await oauthApi.getAccessToken(ctx.query.code);
      ctx.logger.info('获取 oauth token 成功: %j', token);
      const openid = token.data.openid;
      const userInfo = await oauthApi.getUser(openid);
      ctx.logger.info('获取用户信息成功: %j', userInfo);
      ctx.body = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>个金生活家</title>
  </head>
  <body>
    <h1>Hi, ${userInfo.nickname}</h1> 欢迎来到个金生活家！<br/><br/><br/>
    <img  src="${userInfo.headimgurl}" alt="">
  </body>
  </html>
      `;
    }

    // 获取二维码
    async getQrcode(text = '') {
      const { ctx } = this;
      /** eslint:disabled */
      try {
        const res = await api.createTmpQRCode(text, 1800);
        ctx.logger.info('生成微信二维码成功: %j', res);
        const url = `${app.config.qrlink}${encodeURIComponent(res.url)}`;
        return url;
      } catch (e) {
        return '';
      }
    }

    // 获取推送信息详情
    async topicPubDetail() {
      const { ctx } = this;
      const TopicPubLogModel = ctx.model.TopicPubLog;
      if (!ctx.query.id) {
        ctx.body = {
          code: 1,
          msg: '非法请求',
        };
        return;
      }
      const pubLog = await TopicPubLogModel.findOne({
        where: {
          id: ctx.query.id,
        },
      });

      if (!pubLog) {
        ctx.body = {
          code: 1,
          msg: '非法请求',
        };
        return;
      }

      ctx.body = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>个金生活家</title>
  </head>
  <body>
  <p>${pubLog.title}</p>
  <p>${pubLog.content}</p>
  </body>
  </html>
      `;
    }

    // 发送短信模板
    async sendTemplate(info) {
      const { app, logger } = this;
      // const abx = await api.getAllPrivateTemplate();

      // ctx.body = abx;
      // return;
      const templateId = wechatConfig.templateWarning;
      // URL置空，则在发送后,点击模板消息会进入一个空白页面（ios）, 或无法点击（android）
      const url = `${app.config.domain}/topicPubDetail?id=${info.pubId}`;
      logger.info('发送模板消息为：%j', { ...info, url });
      const data = {
        first: {
          value: info.title.length > 50 ? info.title.slice(0, 50) + '...' : info.title,
          color: '#333',
        },
        keyword1: {
          value: '告警通知',
          color: '#333',
        },
        keyword2: {
          value: '高',
          color: '#DD443C',
        },
        remark: {
          value: info.content.length > 100 ? info.content.slice(0, 100) + '...' : info.content,
          color: '#333',
        },
      };
      const res = await api.sendTemplate(info.openid, templateId, url, '#333', data);
      logger.info('推送模板消息成功: %j', res);
      return res;
    }
  }

  // 微信消息通知
  HomeController.prototype.notify = Wechat(app.config.wechat).middleware(async (message, ctx) => {
    ctx.logger.info('微信消息通知: %j', message);
    return await ctx.service.wechat.handle(message);
  });

  return HomeController;
};
