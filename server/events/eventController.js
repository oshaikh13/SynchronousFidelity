var Event = require('./eventModel.js')();

function prettyPrint(obj) {
  console.log(JSON.stringify(obj, null , 2));
}

module.exports = {
  createEvent: function(req, res, next) {

    var newEvent = req.body;
    newEvent.timestamp = Date.now();

    Event.insert(newEvent);

    res.sendStatus(200);

  }
}