var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({

  eventName: String,
  timestamp: Number,
  displayName: String

});

module.exports = mongoose.model('events', EventSchema);