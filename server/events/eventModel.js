var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({

  eventName: String,
  timestamp: Number

});

module.exports = mongoose.model('events', EventSchema);