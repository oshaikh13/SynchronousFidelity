var mongoose = require('mongoose'),
    json2csv = require('json2csv'),
    fs = require('fs');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI); // connect to mongo database

var Action = require('./actionModel.js');
var Event = require('./eventModel.js');


var actionFields = [
              'timestamp',
              'displayname',
              'head.pitch',
              'head.yaw', 
              'head.roll',
              'body.pitch',
              'body.yaw', 
              'body.roll',
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

var eventFields = [
  'eventName',
  'timestamp'
];

Action.find({}).lean().exec(function (err, actions) {
  if (err) {
    console.log("Error querying database");
    return;
  };

  var csv = json2csv({ data: actions, fields: actionFields });

  fs.writeFile(__dirname + '/actions.csv', csv, function(err) {
    if (err) {
      console.log('Failed to write data file');
      return;
    }

    console.log("Complete writing actions file!")

  });


})

Event.find({}).lean().exec(function (err, events) {
  if (err) {
    console.log("Error querying database");
    return;
  };

  var csv = json2csv({ data: events, fields: eventFields });

  fs.writeFile(__dirname + '/events.csv', csv, function(err) {
    if (err) {
      console.log('Failed to write data file');
      return;
    }

    console.log("Complete writing events file!")

  });


})
