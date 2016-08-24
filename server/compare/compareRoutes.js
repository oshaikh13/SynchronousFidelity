var compareController = require('./compareController.js');

module.exports = function (app) {
  app.get('/correlation', compareController.rCorrelation)
};
