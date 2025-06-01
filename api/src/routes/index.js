const { Router } = require('express');
const auth = require('../middlewares/auth');
const targets = require('./targets');
const alerts  = require('./alerts');

const r = Router();
r.post('/auth/register', require('./auth').register);
r.post('/auth/login',    require('./auth').login);

r.use(auth);            // everything below needs JWT
 r.use('/targets', targets);
r.use('/alerts',  alerts);
module.exports = r;
