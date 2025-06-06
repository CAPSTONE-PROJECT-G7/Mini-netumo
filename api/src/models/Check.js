module.exports = (sequelize, DataTypes) =>
  sequelize.define('Check', {
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status_code: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    latency_ms: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'checks',
    underscored: true
  });

