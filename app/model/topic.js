'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const Topic = app.model.define('topic', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
    code: { type: STRING(32), allowNull: false, defaultValue: '' },
    title: { type: STRING(256), allowNull: false, defaultValue: '' },
    type: { type: STRING(16), allowNull: false, defaultValue: 'SINGLE' },
    status: { type: STRING(16), allowNull: false, defaultValue: 'NORMAL' },
    created_at: DATE,
    updated_at: DATE,
  });

  Topic.STATUS_NORMAL = 'NORMAL';
  Topic.STATUS_CLOSE = 'CLOSE';

  Topic.TYPE_SINGLE = 'SINGLE';
  Topic.TYPE_MULTI = 'MULTI';
  return Topic;
};
