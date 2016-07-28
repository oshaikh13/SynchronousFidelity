
 // The name of the new mapping
var MAPPING_NAME = "com.synchronousfidelity.events.controller";

// Create a new mapping object
var mapping = Controller.newMapping(MAPPING_NAME);

// Add a route to the mapping object
 mapping.from(Controller.Standard.LT).to(function (value) {
     print("Right trigger is " + value);
 });

//Enable the new mapping
 Controller.enableMapping(MAPPING_NAME);

// Disable the new mapping when the script ends
 Script.scriptEnding.connect(function () {
     Controller.disableMapping(MAPPING_NAME);
});