// TODO: ES6-ify

// Load .env file only if not in production
if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
}

var express     = require('express');

var app = express(),
    cors = require('cors');
var server = require('http').Server(app);

app.use(cors());

// configure our server with all the middleware and and routing

require('./config/middleware.js')(app, express);

server.listen(process.env.PORT || 8000);

module.exports = app;

