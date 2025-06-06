// src/models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.POSTGRES_URL, { logging: false });


/* ─── make sequelize immediately available ─── */


// Import models using factory functions
const User   = require('./User')(sequelize, DataTypes);
const Target = require('./Target')(sequelize, DataTypes);
const Check  = require('./Check')(sequelize, DataTypes);
const CertStatus   = require('./CertStatus')(sequelize, DataTypes);
const DomainStatus= require('./DomainStatus')(sequelize, DataTypes);
const Alert  = require('./Alert')(sequelize, DataTypes);

/* ---- relations ---- */
User.hasMany(Target,       { foreignKey: 'user_id' });
Target.belongsTo(User,     { foreignKey: 'user_id' });

Target.hasMany(Check,        { foreignKey: 'target_id' });
Target.hasMany(CertStatus,   { foreignKey: 'target_id' });
Target.hasMany(DomainStatus, { foreignKey: 'target_id' });
Target.hasMany(Alert,        { foreignKey: 'target_id' });

module.exports = {
  sequelize,
  User,
  Target,
  Check,
  CertStatus,
  DomainStatus,
  Alert
};