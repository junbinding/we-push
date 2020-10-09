'use strict';
const Queue = require('bull');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  configWillLoad() {
  }

  async didLoad() {
    // 开启队列
    this.app.queue = new Queue(this.app.config.queue.msgcenter, {
      redis: this.app.config.redis.client,
      limiter: {
        max: 1000,
        duration: 5000,
      },
    });

    const ctx = await this.app.createAnonymousContext();
    this.app.queue.process(function(job, done) {
      return ctx.service.getui.sendByCode(job.data.data).then(() => done());
    });
  }

  async willReady() {
    // TODO
  }

  async didReady() {
    // 应用已经启动完毕

    // const ctx = await this.app.createAnonymousContext();
    // await ctx.service.Biz.request();
  }
}

module.exports = AppBootHook;
