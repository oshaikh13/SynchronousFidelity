
var fs = require('fs')

var actionEmitterText = fs.readFileSync(__dirname + '/actionEmitter.js', 'utf8');
var eventEmitterText = fs.readFileSync(__dirname + '/eventEmitter.js', 'utf8');
var synchronyColorCubeText = fs.readFileSync(__dirname + '/synchronyColorCube.js', 'utf8');


function baseURLAttacher (script, serverIpAddress) {
  return `\nvar baseURL = "` + serverIpAddress + `";\n` + script;
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
