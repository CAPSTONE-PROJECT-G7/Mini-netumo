const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

module.exports = sequelize.define('CertStatus', {
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  days_to_expiry: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'cert_statuses',
  underscored: true
});
