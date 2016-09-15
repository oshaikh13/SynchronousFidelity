var db = require('../config/lokiConfig.js');

var eventModel;

module.exports = function () {
  if (!eventModel) {
    eventModel = db.addCollection('events');
  }

  return eventModel;
}