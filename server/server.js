// TODO: ES6-ify
require('dotenv').load();

var express     = require('express'),
    mongoose    = require('mongoose');

mongoose.Promise = global.Promise;

var app = express(),
    cors = require('cors');
var server = require('http').Server(app);

app.use(cors());

// connect to mongo database
mongoose.connect(process.env.MONGODB_URI, 
  { 
    server: { 
      socketOptions: { 
        connectTimeoutMS: +process.env.MONGODB_MAX_TIMEOUT 
      }
    }
  }
); 

console.log("Listening on PORT: " + process.env.PORT);
console.log("Using MONGODB_URI: " + process.env.MONGODB_URI);
console.log("Using MONGODB_MAX_TIMEOUT: " + process.env.MONGODB_MAX_TIMEOUT);


// configure our server with all the middleware and and routing

require('./config/middleware.js')(app, express);

server.listen(process.env.PORT);

module.exports = app;

