
var frame = 0;

function prettyPrint(obj) {
  print(JSON.stringify(obj, null , 2));
}

function replaceQuaternions(quatLocation, bodyPart) {
  prettyPrint(quatLocation);
  prettyPrint(bodyPart);

  // Documentation says this returns radians.
  // Surprise! It returns degrees
  var angles = Quat.safeEulerAngles(quatLocation);

  bodyPart.pitch = angles.x;
  bodyPart.yaw = angles.y;
  bodyPart.roll = angles.z;

  return bodyPart;
}


function sendToServer (req) {
  // POST using XMLHttpRequest
  if (!req) {
    return; // 'undefined' or 'null' for whatever reason

  } 

  if (frame % 50 === 0) {
    JSON.stringify(req, null, 2);
  }


  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
  // you need to make a new instance for every HTTP request

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.status !== 200) {
      print("Failed to save a datapoint");
    } 
  };


  xmlhttp.open("POST", "http://localhost:8000/api/action/create");
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify(req));

}

function getPositions () {

  // Only send requests on every 3rd frame
  if (frame % 3 === 0) {

    // Request Structure
    var req = {
      displayName: MyAvatar.displayName,

      hands: {
        leftHand : {
          position: MyAvatar.getLeftHandPosition(),
          pose: MyAvatar.getLeftHandPose()
        },

        rightHand : {
          position: MyAvatar.getRightHandPosition(),
          pose: MyAvatar.getRightHandPose()
        }
      },

      palms: {

        rightPalm: {
          position: MyAvatar.getRightPalmPosition(),
          rotation: MyAvatar.getRightPalmRotation()
        },

        leftPalm: {
          position: MyAvatar.getLeftPalmPosition(),
          rotation: MyAvatar.getLeftPalmRotation()
        }

      },

      head: {
        position: MyAvatar.getHeadPosition(),
        pitch: MyAvatar.headRoll,
        yaw: MyAvatar.headYaw,
        roll: MyAvatar.headPitch
      },

      body: {
        pitch: MyAvatar.bodyPitch,
        yaw: MyAvatar.bodyYaw,
        roll: MyAvatar.bodyRoll
      },

      timestamp: Date.now()
    };

    var hands = req.hands;
    if (!hands.leftHand.pose.valid || !hands.rightHand.pose.valid) {
      // Checks if the hands are NOT being controlled by the vive controller
      // This is also run if the vive isn't in use, and you're using a display
      print("NO CONTROLLER")
      return;
    }

    for (var palmType in req.palms) {
      var palm = req.palms[palmType];
      var palmRotation = palm.rotation;

      palm = replaceQuaternions(palmRotation, palm);
      palm.rotation = undefined;
    }


    for (var handType in req.hands) {
      var hand = req.hands[handType];
      var handPose = hand.pose.rotation;

      hand = replaceQuaternions(handPose, hand);
      hand.pose = undefined;
    }


    sendToServer(req);
  }


  frame++;

}

Script.update.connect(getPositions);

