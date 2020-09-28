'use strict';

const WechatAPI = require('co-wechat-api');
const Wechat = require('co-wechat');
const OAuth = require('co-wechat-oauth');
const CryptoJS = require('crypto-js');
const { redis } = require('../../config/plugin');


module.exports = app => {
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
      const { ctx, app } = this;
      // 1. 判断是否有 session
      let loginCode = '';
      if (!ctx.session.user) {
        loginCode = CryptoJS.MD5(Date.now().toString() + Math.random()).toString().toUpperCase();
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
      // 2. 如果没有 session，则 H5 默认授权，PC 展示微信登录二维码
      // 3. 如果有 session
      // 3.1 获取用户历史的推送码信息
      // 3.2 如果有历史推送码，则展示推送码
      // 3.3 如果没有，则展示按钮，引导生成推送码
      ctx.body = 'hi, my name dingjunbin';
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

    // 发送短信模板
    async sendTemplate() {
      const { ctx, app } = this;
      // const abx = await api.getAllPrivateTemplate();

      // ctx.body = abx;
      // return;
      const templateId = '3nV8-pQhNVHxNsTniXWBQruPob85BwHu-UDDhz1AqVE';
      // URL置空，则在发送后,点击模板消息会进入一个空白页面（ios）, 或无法点击（android）
      const url = `${app.config.domain}/wx/hi`;
      const data = {
        first: {
          value: '',
          color: '#333',
        },
        keyword1: {
          value: '日常告警',
          color: '#333',
        },
        keyword2: {
          value: '高级',
          color: '#DD443C',
        },
        remark: {
          value: '请点击查看详情',
          color: '#333',
        },
      };
      const res = await api.sendTemplate('oIs2d04qvlfLtdrkPL82NwmG0e8Q', templateId, url, '#333', data);
      ctx.logger.info('推送模板消息成功: %j', res);
      ctx.body = res;
    }
  }

  // 微信消息通知
  HomeController.prototype.notify = Wechat(app.config.wechat).middleware(async (message, ctx) => {
    ctx.logger.info('微信消息通知: %j', message);
    return await ctx.service.wechat.handle(message);
  });

  return HomeController;
};
