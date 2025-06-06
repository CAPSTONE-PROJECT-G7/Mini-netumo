module.exports = (sequelize, DataTypes) =>
  sequelize.define('Target', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    label: {
      type: DataTypes.STRING
    },
    paused: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'targets',
    underscored: true
  });
