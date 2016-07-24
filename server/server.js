// Load .env file only if not in production
if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
  console.log('connecting to ' + process.env.MONGODB_URI)
}

var express     = require('express'),
    mongoose    = require('mongoose');

var app = express(),
    cors = require('cors');
var server = require('http').Server(app);

app.use(cors());
mongoose.connect(process.env.MONGODB_URI); // connect to mongo database

// configure our server with all the middleware and and routing

require('./config/middleware.js')(app, express);

server.listen(process.env.PORT || 8000);


module.exports = app;

