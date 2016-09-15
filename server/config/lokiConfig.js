var loki = require('lokijs');

var db = new loki('data.json');

module.exports = db;
