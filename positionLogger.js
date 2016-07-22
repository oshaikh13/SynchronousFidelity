
var frame = 0;

function sendToServer (req) {
  // POST using XMLHttpRequest
}

function getPositions () {

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

  }

  sendToServer(req);

  frame++;

}

Script.update.connect(getPositions);

