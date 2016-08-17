var compareController = require('./compareController.js');

module.exports = function (app) {
  app.post('/distance', compareController.distancePoints)
};
