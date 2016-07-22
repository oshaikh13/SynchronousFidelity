var Action = require('./actionModel.js');

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

module.exports = {
  createAction: function(req, res, next) {

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

    Action.create(newAction, function(err, res){
      if (err) res.send(400);
      res.send(200);
    })

  }
}

