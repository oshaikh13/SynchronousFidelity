var express = require('express');
var app = express();

var Action = require('./actions/actionModel.js');

// Radians.
function getAngles(w, x, y, z) {
  var obj = {}
  obj.roll  = Mathf.Atan2(2*y*w - 2*x*z, 1 - 2*y*y - 2*z*z);
  obj.pitch = Mathf.Atan2(2*x*w - 2*y*z, 1 - 2*x*x - 2*z*z);
  obj.yaw   =  Mathf.Asin(2*x*y + 2*z*w);
  return obj;
}

function replaceQuaternions(quatLocation, bodyPart) {
  var angles = getAngles(quatLocation.w, quatLocation.x, quatLocation.y, quatLocation.z);
  bodyPart.pitch = angles.pitch;
  bodyPart.yaw = angles.yaw;
  bodyPart.roll = angles.roll;
  return bodyPart;
}

app.get('/', function (req, res) {
  res.send('Active!');
});

app.post('/action', function (req, res) {

  var newAction = req.body;
  for (var palm in newAction.palms) {
    var palmRotation = palm.rotation;
    palm = replaceQuaternions(palmRotation, palm);
    palm.rotation = undefined;
  }

  for (var hand in newAction.hands) {
    var handPose = hand.pose;
    hand = replaceQuaternions(handPose, hand);
    hand.pose = undefined;
  }

});

app.post('/event', function (req, res) {
  res.send("hello");
});

app.listen(3000, function () {
  console.log('Position Listener on port 3000');
});