var mongoose = require('mongoose'),
    json2csv = require('json2csv'),
    fs = require('fs');

require('dotenv').config();

var Action = require('./actionModel.js');

var fields = [
              'timestamp',
              'displayname',
              'head.pitch',
              'head.yaw', 
              'head.roll',
              'head.position.x',
              'head.position.y',
              'head.position.z',
              'hands.leftHand.pitch',
              'hands.leftHand.yaw', 
              'hands.leftHand.roll',
              'hands.leftHand.position.x',
              'hands.leftHand.position.y',
              'hands.leftHand.position.z',
              'hands.rightHand.pitch',
              'hands.rightHand.yaw', 
              'hands.rightHand.roll',
              'hands.rightHand.position.x',
              'hands.rightHand.position.y',
              'hands.rightHand.position.z',
              'palms.leftPalm.pitch',
              'palms.leftPalm.yaw', 
              'palms.leftPalm.roll',
              'palms.leftPalm.position.x',
              'palms.leftPalm.position.y',
              'palms.leftPalm.position.z',
              'palms.rightPalm.pitch',
              'palms.rightPalm.yaw', 
              'palms.rightPalm.roll',
              'palms.rightPalm.position.x',
              'palms.rightPalm.position.y',
              'palms.rightPalm.position.z'
              ];

Action.find({}).lean().exec(function (err, actions) {
  if (err) {
    console.log("Error querying database");
    return;
  };

  var csv = json2csv({ data: actions, fields: fields });

  fs.writeFile(__dirname + '/file.csv', csv, function(err) {
    if (err) {
      console.log('Failed to write data file');
      return;
    }

    console.log("Complete!")

  });


})

mongoose.connect(process.env.MONGODB_URI); // connect to mongo database