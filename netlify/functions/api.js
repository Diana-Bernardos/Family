const serverless = require('serverless-http');
const app = require('../../backend/server');

// Bridge Express to Netlify Functions
module.exports.handler = serverless(app);
