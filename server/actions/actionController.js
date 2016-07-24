var Action = require('./actionModel.js');

function getAngles(q) {
  var obj = {}
  var w = q.w
  var x = q.x
  var y = q.y
  var z = q.z

  obj.roll  = Math.atan2(2*y*w - 2*x*z, 1 - 2*y*y - 2*z*z);
  obj.pitch = Math.atan2(2*x*w - 2*y*z, 1 - 2*x*x - 2*z*z);
  obj.yaw   =  Math.asin(2*x*y + 2*z*w);
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

