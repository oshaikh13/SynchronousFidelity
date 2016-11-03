
var baseURL = "http://localhost:8000/"

// The name of the new mapping
var MAPPING_NAME = "com.synchronousfidelity.events.controller";

var eventNumber = 1;

var DEBUG = false;

// Create a new mapping object
var mapping = Controller.newMapping(MAPPING_NAME);

// Add a route to the mapping object
// Events are fired on Right Trigger presses

mapping.from(Controller.Standard.RightGrip).to(function (value) {


  if (value !== 1) {
    // Button is "unpressed"
    return;
  }

  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
  // you need to make a new instance for every HTTP request
  
  if (DEBUG) return;

  xmlhttp.onreadystatechange = function () {
    print("Saved to server with response code: " + xmlhttp.status);
  };

  var req = {
    eventName: "Event " + eventNumber,
    displayName: MyAvatar.displayName
  };

  Window.alert("Fired Event #" + eventNumber)

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