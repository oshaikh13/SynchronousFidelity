
var fs = require('fs')

var MovementTrackerText = fs.readFileSync(__dirname + '/MovementTracker.js', 'utf8');
var EventTrackerText = fs.readFileSync(__dirname + '/EventTracker.js', 'utf8');
var synchronyColorCubeText = fs.readFileSync(__dirname + '/synchronyColorCube.js', 'utf8');


function baseURLAttacher (serverIpAddress, script) {
  // Somewhat dangerous. Just assume the serverIP isn't javascript code, because you're running this locally.
  // If you're not, hardcode the serverIp please.
  return "\nvar baseURL = \""+ serverIpAddress + "\";\n" + script;
}

module.exports = {
  getMovementTrackerText: function (serverIpAddress) {
    return baseURLAttacher(serverIpAddress, MovementTrackerText);
  },

  getEventTrackerText: function (serverIpAddress) {
    return baseURLAttacher(serverIpAddress, EventTrackerText);
  },

  getSynchronyColorCubeText: function (serverIpAddress) {
    return baseURLAttacher(serverIpAddress, synchronyColorCubeText);
  }
}
