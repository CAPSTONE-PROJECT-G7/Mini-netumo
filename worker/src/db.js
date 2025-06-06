const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.POSTGRES_URL, { logging: false });

const models = require('../models');          
module.exports = { ...models };               
