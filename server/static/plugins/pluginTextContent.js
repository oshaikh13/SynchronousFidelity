
module.exports = {
  getActionEmitterText: function (serverIpAddress) {
    // Long, minified, js file :)
    var scriptContent = `function avoidSpam(a){frame%SPAM_FRAME_COUNT===0&&a()}function replaceQuaternions(a,b){var c=Quat.safeEulerAngles(a);return b.pitch=c.x,b.yaw=c.y,b.roll=c.z,b}function sendToServer(a){if(a){var b=new XMLHttpRequest;b.onreadystatechange=function(){var a=!1;a=b.status,avoidSpam(function(){print("Saved to server with response code: "+a)})},b.open("POST",baseURL+"api/action/create"),b.setRequestHeader("Content-Type","application/json;charset=UTF-8"),b.send(JSON.stringify(a))}}function getPositions(){var a=function(){frame++};if(frame%FRAME_SEND_COUNT===0){var b={displayName:MyAvatar.displayName,hands:{leftHand:{position:MyAvatar.getLeftHandPosition(),pose:MyAvatar.getLeftHandPose()},rightHand:{position:MyAvatar.getRightHandPosition(),pose:MyAvatar.getRightHandPose()}},palms:{rightPalm:{position:MyAvatar.getRightPalmPosition(),rotation:MyAvatar.getRightPalmRotation()},leftPalm:{position:MyAvatar.getLeftPalmPosition(),rotation:MyAvatar.getLeftPalmRotation()}},head:{position:MyAvatar.getHeadPosition(),pitch:MyAvatar.headRoll,yaw:MyAvatar.headYaw,roll:MyAvatar.headPitch},body:{pitch:MyAvatar.bodyPitch,yaw:MyAvatar.bodyYaw,roll:MyAvatar.bodyRoll}};b.hands;for(var d in b.hands){var e=b.hands[d],f=e.pose.rotation;e=replaceQuaternions(f,e),e.pose=void 0}for(var g in b.palms){var h=b.palms[g],i=h.rotation;h=replaceQuaternions(i,h),h.rotation=void 0}avoidSpam(function(){console.log(b)}),sendToServer(b)}a()}var baseURL="` + serverIpAddress + `",frame=0,DEBUG=!1,SPAM_FRAME_COUNT=50,FRAME_SEND_COUNT=3;Script.update.connect(getPositions);`
    return scriptContent;

  },

  getEventEmitterText: function (serverIpAddress) {

    var scriptContent = `var baseURL="` + serverIpAddress + `",MAPPING_NAME="com.synchronousfidelity.events.controller",eventNumber=1,DEBUG=!1,mapping=Controller.newMapping(MAPPING_NAME);mapping.from(Controller.Standard.RightGrip).to(function(e){if(1===e){var n=new XMLHttpRequest;if(!DEBUG){n.onreadystatechange=function(){print("Saved to server with response code: "+n.status)};var t={eventName:"Event "+eventNumber,displayName:MyAvatar.displayName};Window.alert("Fired Event #"+eventNumber),eventNumber++,n.open("POST",baseURL+"api/event/create"),n.setRequestHeader("Content-Type","application/json;charset=UTF-8"),n.send(JSON.stringify(t)),print("FIRED EVENT "+eventNumber)}}}),Controller.enableMapping(MAPPING_NAME),Script.scriptEnding.connect(function(){Controller.disableMapping(MAPPING_NAME)});`
    return scriptContent;
  }
}