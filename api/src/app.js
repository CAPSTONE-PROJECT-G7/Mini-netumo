require('dotenv').config();
const express = require('express');
const morgan  = require('morgan');
const cors    = require('cors');            // Add this line
const jwt     = require('jsonwebtoken');
const swagger = require('swagger-ui-express');
const YAML    = require('yamljs');
const { sequelize } = require('./models');
const routes  = require('./routes');

const app = express();

// Configure CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,                        // if you need cookies or auth headers
}));

app.use(express.json());
app.use(morgan('tiny'));

app.use('/docs', swagger.serve, swagger.setup(YAML.load('./openapi.yml')));
app.use('/api', routes);

app.get('/health', (_, res) => res.send('OK'));

sequelize.sync().then(() => app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
}));
