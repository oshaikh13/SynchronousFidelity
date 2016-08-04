
var baseURL = "https://salty-stream-30260.herokuapp.com/"

// The name of the new mapping
var MAPPING_NAME = "com.synchronousfidelity.events.controller";

var eventNumber = 1;

var DEBUG = false;

// Create a new mapping object
var mapping = Controller.newMapping(MAPPING_NAME);

// Add a route to the mapping object
mapping.from(Controller.Standard.LT).to(function (value) {

  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
  // you need to make a new instance for every HTTP request

  if (value !== 1) {
    // trigger isn't pressed down completely.
    return;
  }
  
  if (DEBUG) return;

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.status !== 200) {
      print("Failed to save a datapoint");
    } 
  };

  var req = {
    eventName: "Event " + eventNumber,
    displayName: MyAvatar.displayName,
    timestamp: Date.now()
  };

  eventNumber++;

  xmlhttp.open("POST", baseURL + "api/event/create");
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify(req));

  print("FIRED EVENT " + eventNumber);

});

//Enable the new mapping
Controller.enableMapping(MAPPING_NAME);

// Disable the new mapping when the script ends
Script.scriptEnding.connect(function () {
  Controller.disableMapping(MAPPING_NAME);
});