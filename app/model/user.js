'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const User = app.model.define('user', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    nickname: { type: STRING(32), allowNull: false, defaultValue: '' },
    openid: { type: STRING(128), allowNull: false, defaultValue: '' },
    avatar: { type: STRING(256), allowNull: false, defaultValue: '' },
    status: { type: STRING(16), allowNull: false, defaultValue: 'NORMAL' },
    created_at: DATE,
    updated_at: DATE,
  });

  User.STATUS_NORMAL = 'NORMAL';
  User.STATUS_CLOSE = 'CLOSE';

  return User;
};
