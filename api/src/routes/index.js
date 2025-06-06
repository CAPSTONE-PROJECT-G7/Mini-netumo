const { Router } = require('express');
const auth = require('../middlewares/auth');
const targets = require('./targets');
const alerts  = require('./alerts');
const authenticateToken = require('../middlewares/auth');  // Note: use the same name

const r = require('express').Router();

r.post('/auth/register', require('./auth').register);
r.post('/auth/login',    require('./auth').login);

r.use(authenticateToken);      // Protect everything below

r.use('/targets', authenticateToken, require('./targets'));
r.use('/alerts',  require('./alerts'));

module.exports = r;

