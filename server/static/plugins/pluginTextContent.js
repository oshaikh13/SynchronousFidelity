
var fs = require('fs')

var actionEmitterText = fs.readFileSync(__dirname + '/actionEmitter.js', 'utf8');
var eventEmitterText = fs.readFileSync(__dirname + '/eventEmitter.js', 'utf8');
var synchronyColorCubeText = fs.readFileSync(__dirname + '/synchronyColorCube.js', 'utf8');


function baseURLAttacher (serverIpAddress, script) {
  // Somewhat dangerous. Just assume the serverIP isn't javascript code, because you're running this locally.
  // If you're not, hardcode the serverIp please.
  return "\nvar baseURL = \""+ serverIpAddress + "\";\n" + script;
}

module.exports = {
  getActionEmitterText: function (serverIpAddress) {
    return baseURLAttacher(serverIpAddress, actionEmitterText);
  },

  getEventEmitterText: function (serverIpAddress) {
    return baseURLAttacher(serverIpAddress, eventEmitterText);
  },

  getSynchronyColorCubeText: function (serverIpAddress) {
    return baseURLAttacher(serverIpAddress, synchronyColorCubeText);
  }
}
