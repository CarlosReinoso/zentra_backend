const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'node-express-boilerplate API documentation',
    version,
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
      description: 'Development server',
    },
    {
      url: 'https://zentra-backend-omega.vercel.app/v1',
      description: 'Staging server',
    },
  ],
};

module.exports = swaggerDef;
