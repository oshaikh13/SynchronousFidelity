var compareController = require('./compareController.js');

module.exports = function (app) {
  app.get('/rawdata', compareController.rawdata);
  app.get('/csvdata', compareController.csvdata);

};
