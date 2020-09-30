'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const TopicPubLog = app.model.define('topic_pub_log', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    topic_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
    title: { type: STRING(64), allowNull: false, defaultValue: '' },
    content: { type: STRING(1024), allowNull: false, defaultValue: '' },
    created_at: DATE,
    updated_at: DATE,
  });

  return TopicPubLog;
};
