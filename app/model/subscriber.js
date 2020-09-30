'use strict';

module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  const Subscriber = app.model.define('subscriber', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
    topic_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
    created_at: DATE,
    updated_at: DATE,
  });

  return Subscriber;
};
