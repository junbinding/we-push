'use strict';

const Service = require('egg').Service;

class TopicService extends Service {
  // 查询单人订阅，如果找不到则创建
  async findSingleOrCreateByUser(info) {
    const { ctx, logger } = this;
    const TopicModel = ctx.model.Topic;
    if (!info.code) {
      info.code = ctx.service.crypto.md5(Date.now().toString() + Math.random());
    }
    const [ topic, created ] = await TopicModel.findOrCreate({
      where: {
        type: TopicModel.TYPE_SINGLE,
        user_id: info.user_id,
      },
      defaults: info,
    });

    logger.info(`查询个人主题：用户ID：${info.user_id}，主题ID：${topic.id}，是否新创建：${created ? '是' : '否'}`);
    return topic;
  }
}

module.exports = TopicService;
