module.exports = (sequelize, DataTypes) =>
  sequelize.define('DomainStatus', {
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    days_to_expiry: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'domain_statuses',
    underscored: true
  });
