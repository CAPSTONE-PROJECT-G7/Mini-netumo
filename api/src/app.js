require('dotenv').config();  const express = require('express');
const morgan  = require('morgan');
const jwt     = require('jsonwebtoken');
const swagger = require('swagger-ui-express');
const YAML    = require('yamljs');
const { sequelize } = require('./models');
const routes  = require('./routes');
         

const app = express();
app.use(express.json(), morgan('tiny'));
app.use('/docs', swagger.serve, swagger.setup(YAML.load('./openapi.yml')));
app.use('/api', routes);

app.get('/health', (_, res) => res.send('OK'));

sequelize.sync().then(() => app.listen(3000));
