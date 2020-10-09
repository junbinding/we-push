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
    // 首页
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

    // 发送消息
    async send() {
      const { ctx, app } = this;
      const { title, code, content = '' } = { ...ctx.query, ...ctx.request.body };

      const rules = {
        code: [
          { required: true, message: '非法请求' },
        ],
        title: [
          { required: true, message: '请输入标题' },
          { max: 200, message: '标题最长200字符' },
        ],
        content: [
          { max: 1000, message: '标题最长1000字符' },
        ],
      };

      await ctx.verify(rules, { ...ctx.query, ...ctx.request.body });

      // 比较内容
      const contentMd5 = ctx.service.crypto.md5(JSON.stringify({ title, content }));
      const cmpKey = `send_compare_${code}`;
      const lastContentMd5 = await app.redis.get(cmpKey);
      if (lastContentMd5 && lastContentMd5 === contentMd5) {
        ctx.body = {
          code: 1,
          msg: '请不要发送相同的内容',
        };
        return;
      }

      app.redis.set(cmpKey, contentMd5, 'EX', 600);

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
        title: title.trim().slice(0, 200),
        content: content.trim().slice(0, 1000),
      });

      const user = await ctx.model.User.findOne({
        where: {
          id: topic.user_id,
        },
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
        attributes: { exclude: [ 'openid' ] },
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

    // OAuth Demo
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

      console.log(ctx.helper.escape(pubLog.content));
      ctx.body = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>个金生活家</title>
  </head>
  <body>
  <p>${ctx.helper.escape(pubLog.title)}</p>
  <p>${ctx.helper.escape(pubLog.content).replace(/\n/g, '<br>')}</p>
  </body>
  </html>
      `;
    }

    // 发送短信模板
    async sendTemplate(info) {
      const { app, logger } = this;

      const templateId = wechatConfig.templateWarning;
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
