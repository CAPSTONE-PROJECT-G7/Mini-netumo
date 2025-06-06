module.exports = (sequelize, DataTypes) =>
  sequelize.define('CertStatus', {
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
