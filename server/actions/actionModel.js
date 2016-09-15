var db = require('../config/lokiConfig.js');

var actionModel;

module.exports = function () {
  if (!actionModel) {
    actionModel = db.addCollection('actions');
  }

  return actionModel;
}