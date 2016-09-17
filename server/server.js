// TODO: ES6-ify

var express     = require('express'),
    mongoose    = require('mongoose');

mongoose.Promise = global.Promise;

var app = express(),
    cors = require('cors');
var server = require('http').Server(app);

app.use(cors());
mongoose.connect(process.env.MONGODB_URI); // connect to mongo database

console.log("Listening on PORT: " + process.env.PORT);
console.log("Using MONGODB_URI: " + process.env.MONGODB_URI);

// configure our server with all the middleware and and routing

require('./config/middleware.js')(app, express);

server.listen(process.env.PORT);

module.exports = app;

