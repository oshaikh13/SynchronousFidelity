
module.exports = {
  getActionEmitterText: function (serverIpAddress) {
    // Long, minified, js file :)
    var scriptContent = `function avoidSpam(a){frame%SPAM_FRAME_COUNT===0&&a()}function replaceQuaternions(a,t){var e=Quat.safeEulerAngles(a);return t.pitch=e.x,t.yaw=e.y,t.roll=e.z,t}function sendToServer(a){if(a){var t=new XMLHttpRequest;t.onreadystatechange=function(){var a=!1;a=t.status,avoidSpam(function(){print("Saved to server with response code: "+a)})},t.open("POST",baseURL+"api/action/create"),t.setRequestHeader("Content-Type","application/json;charset=UTF-8"),t.send(JSON.stringify(a))}}function getPositions(){var a=function(){frame++};if(frame%3===0){var t={displayName:MyAvatar.displayName,hands:{leftHand:{position:MyAvatar.getLeftHandPosition(),pose:MyAvatar.getLeftHandPose()},rightHand:{position:MyAvatar.getRightHandPosition(),pose:MyAvatar.getRightHandPose()}},palms:{rightPalm:{position:MyAvatar.getRightPalmPosition(),rotation:MyAvatar.getRightPalmRotation()},leftPalm:{position:MyAvatar.getLeftPalmPosition(),rotation:MyAvatar.getLeftPalmRotation()}},head:{position:MyAvatar.getHeadPosition(),pitch:MyAvatar.headRoll,yaw:MyAvatar.headYaw,roll:MyAvatar.headPitch},body:{pitch:MyAvatar.bodyPitch,yaw:MyAvatar.bodyYaw,roll:MyAvatar.bodyRoll}},e=t.hands;if(!(DEBUG||e.leftHand.pose.valid&&e.rightHand.pose.valid&&HMD.active))return avoidSpam(function(){print("The controller is not connected and/or the HMD is not active")}),void a();for(var o in t.hands){var i=t.hands[o],n=i.pose.rotation;i=replaceQuaternions(n,i),i.pose=void 0}for(var r in t.palms){var s=t.palms[r],d=s.rotation;s=replaceQuaternions(d,s),s.rotation=void 0}sendToServer(t)}a()}var baseURL="` + serverIpAddress + `",frame=0,DEBUG=!1,SPAM_FRAME_COUNT=50;Script.update.connect(getPositions);`
    return scriptContent;

  },

  getEventEmitterText: function (serverIpAddress) {

    var scriptContent = `var baseURL="` + serverIpAddress + `",MAPPING_NAME="com.synchronousfidelity.events.controller",eventNumber=1,DEBUG=!1,mapping=Controller.newMapping(MAPPING_NAME);mapping.from(Controller.Standard.RightGrip).to(function(e){if(1===e){var n=new XMLHttpRequest;if(!DEBUG){n.onreadystatechange=function(){print("Saved to server with response code: "+n.status)};var t={eventName:"Event "+eventNumber,displayName:MyAvatar.displayName};Window.alert("Fired Event #"+eventNumber),eventNumber++,n.open("POST",baseURL+"api/event/create"),n.setRequestHeader("Content-Type","application/json;charset=UTF-8"),n.send(JSON.stringify(t)),print("FIRED EVENT "+eventNumber)}}}),Controller.enableMapping(MAPPING_NAME),Script.scriptEnding.connect(function(){Controller.disableMapping(MAPPING_NAME)});`
    return scriptContent;
  }
}