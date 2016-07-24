var Action = require('./actionModel.js');

function getAngles(q) {
  var obj = {}

  obj.yaw   = Math.atan2(2.0*(q.y*q.z + q.w*q.x), q.w*q.w - q.x*q.x - q.y*q.y + q.z*q.z);
  obj.pitch = Math.asin(-2.0*(q.x*q.z - q.w*q.y));
  obj.roll  = Math.atan2(2.0*(q.x*q.y + q.w*q.z), q.w*q.w + q.x*q.x - q.y*q.y - q.z*q.z);
  return obj;
}

function replaceQuaternions(quatLocation, bodyPart) {

  var angles = getAngles(quatLocation);
  prettyPrint(quatLocation);
  bodyPart.pitch = angles.pitch;
  bodyPart.yaw = angles.yaw;
  bodyPart.roll = angles.roll;
  return bodyPart;
}

function prettyPrint(obj) {
  console.log(JSON.stringify(obj, null , 2));
}

module.exports = {
  createAction: function(req, res, next) {

    var newAction = req.body;

    // two palm/hand types: left or right

    for (var palmType in newAction.palms) {
      var palm = newAction.palms[palmType];
      var palmRotation = palm.rotation;
      palm = replaceQuaternions(palmRotation, palm);
      palm.rotation = undefined;
    }


    for (var handType in newAction.hands) {
      var hand = newAction.hands[handType];
      var handPose = hand.pose.rotation;

      hand = replaceQuaternions(handPose, hand);
      hand.pose = undefined;
    }

    Action.create(newAction, function(err, doc){

      if (err) {
        res.sendStatus(400);
      } else res.sendStatus(200);

    })

  }
}

