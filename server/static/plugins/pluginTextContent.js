
var fs = require('fs')

var MovementTrackerText = fs.readFileSync(__dirname + '/MovementTracker.js', 'utf8');
var EventTrackerText = fs.readFileSync(__dirname + '/EventTracker.js', 'utf8');
var SynchronyColorCubeText = fs.readFileSync(__dirname + '/SynchronyColorCube.js', 'utf8');

// Somewhat dangerous. Just assume the variables aren't javascript code, because you're running this locally.
// If you're not, hardcode the variables please.
function defineStatic (varName, varValue) {
  return "\nvar " + varName + " = \""+ varValue + "\";\n"
}

module.exports = {
  getMovementTrackerText: function (serverIpAddress) {
    return defineStatic("baseURL", serverIpAddress) + MovementTrackerText;
  },

  getEventTrackerText: function (serverIpAddress) {
    return defineStatic("baseURL", serverIpAddress) + EventTrackerText;
  },

  getSynchronyColorCubeText: function (serverIpAddress, username, comparator) {
    return defineStatic("baseURL", serverIpAddress)
     + defineStatic("username", username)
     + defineStatic("comparator", comparator)
     + SynchronyColorCubeText;
  }
}
