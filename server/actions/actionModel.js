var mongoose = require('mongoose');

var ActionSchema = new mongoose.Schema({

  displayName: String,

  hands: {
    leftHand : {
      position: {},
      rotation: {}
    },

    rightHand : {
      position: {},
      rotation: {}
    }
  },


  head: {
    position: {},
    rotation: {}
  },


  timestamp: Number

});

module.exports = mongoose.model('actions', ActionSchema);