var eventController = require('./eventController.js');

module.exports = function (app) {
  // app === userRouter injected from middlware.js

  app.post('/create', eventController.createEvent);
  app.get('/', eventController.getEvents);


};
