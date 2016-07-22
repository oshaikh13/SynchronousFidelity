var actionController = require('./actionController.js'),

module.exports = function (app) {
  // app === userRouter injected from middlware.js

  app.post('/create', actionController.createAction);

};
