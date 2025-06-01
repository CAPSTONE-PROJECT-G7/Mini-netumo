// src/models/index.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: 'postgres',
  logging: false,
  pool: { max: 10, min: 0 }
});

/* ─── make sequelize immediately available ─── */
module.exports = { sequelize };  

/* ─── now import model files ─── */
const User         = require('./User');
const Target       = require('./Target');
const Check        = require('./Check');
const CertStatus   = require('./CertStatus');
const DomainStatus = require('./DomainStatus');
const Alert        = require('./Alert');

/* ─── define associations ─── */
User.hasMany(Target,  { foreignKey: 'user_id' });
Target.belongsTo(User,{ foreignKey: 'user_id' });

Target.hasMany(Check,        { foreignKey: 'target_id' });
Target.hasMany(CertStatus,   { foreignKey: 'target_id' });
Target.hasMany(DomainStatus, { foreignKey: 'target_id' });
Target.hasMany(Alert,        { foreignKey: 'target_id' });

User.hasMany(Alert, { foreignKey: 'user_id' });

/* ─── export everything else ─── */
module.exports = {
  sequelize,
  User,
  Target,
  Check,
  CertStatus,
  DomainStatus,
  Alert
};
