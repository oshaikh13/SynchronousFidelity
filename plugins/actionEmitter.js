
var baseURL = "https://salty-stream-30260.herokuapp.com/"

var frame = 0;

var DEBUG = false;

var SPAM_FRAME_COUNT = 25;

// Avoid spamming the console with a ton of messages. Not fun.
function avoidSpam(cb) {
  if (frame % SPAM_FRAME_COUNT === 0) {
    cb();
  }
}

function replaceQuaternions(quatLocation, bodyPart) {
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

  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
  // you need to make a new instance for every HTTP request

  xmlhttp.onreadystatechange = function () {
    var err = false;

    if (xmlhttp.status !== 200) {
      err = !err;
    } 

    avoidSpam(function(){
      if (err) {
        print("Failed to save a datapoint");
      } else {
        print("Successfully sent data to server");
      }
    })
  };


  xmlhttp.open("POST", baseURL + "api/action/create");
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
        // Relative to head position
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
        // 'World Space in game' coordinates
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
    if (!DEBUG && (!hands.leftHand.pose.valid || !hands.rightHand.pose.valid)) {
      // Checks if the hands are NOT being controlled by the vive controller
      // This is also run if the vive isn't in use, and you're using a display
      avoidSpam(function(){
        print("The controller is not connected and/or the HMD is not active");
      });

      return;
    }

    for (var handType in req.hands) {
      var hand = req.hands[handType];
      var handPose = hand.pose.rotation;

      hand = replaceQuaternions(handPose, hand);
      hand.pose = undefined;
    }


    for (var palmType in req.palms) {
      var palm = req.palms[palmType];
      var palmRotation = palm.rotation;

      palm = replaceQuaternions(palmRotation, palm);
      palm.rotation = undefined;
    }


    sendToServer(req);
  }

  frame++;

}

Script.update.connect(getPositions);

