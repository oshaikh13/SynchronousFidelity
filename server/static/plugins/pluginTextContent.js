
var fs = require('fs')

var actionEmitterText = fs.readFileSync(__dirname + '/actionEmitter.js', 'utf8');
var eventEmitterText = fs.readFileSync(__dirname + '/eventEmitter.js', 'utf8');

module.exports = {
  getActionEmitterText: function (serverIpAddress) {

    var scriptContent =  `\nvar baseURL = "` + serverIpAddress + `";\n` + actionEmitterText;
    return scriptContent;

  },

  getEventEmitterText: function (serverIpAddress) {

    var scriptContent = `\nvar baseURL = "` + serverIpAddress + `";\n` + actionEmitterText;
    return scriptContent;

  }
}
