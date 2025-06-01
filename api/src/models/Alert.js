const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

module.exports = sequelize.define('Alert', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT
  },
  sent_via: {
    type: DataTypes.STRING
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'alerts',
  underscored: true
});
