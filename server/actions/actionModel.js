var mongoose = require('mongoose');

var ActionSchema = new mongoose.Schema({

  displayName: String,

  hands: {
    leftHand : {
      position: {},
      pitch: Number,
      yaw: Number,
      roll: Number
    },

    rightHand : {
      position: {},
      pitch: Number,
      yaw: Number,
      roll: Number
    }
  },

  palms: {

    rightPalm: {
      position: {},
      pitch: Number,
      yaw: Number,
      roll: Number
    },

    leftPalm: {
      position: {},
      pitch: Number,
      yaw: Number,
      roll: Number
    }

  },

  head: {
    position: {},
    pitch: Number,
    yaw: Number,
    roll: Number
  },

  body: {
    pitch: Number,
    yaw: Number,
    roll: Number
  },

  timestamp: Number

});

module.exports = mongoose.model('actions', ActionSchema);