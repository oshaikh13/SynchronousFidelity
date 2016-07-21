var frame = 0;

function getPositions () {

  if (frame % 3 === 0) {

    // Request Structure
    var req = {
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
        position: {}
      },

      camera: {},

      timestamp: Date.now()
    };



  }

  frame++;

}

Script.update.connect(getPositions);

