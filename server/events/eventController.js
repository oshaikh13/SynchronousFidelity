var Event = require('./eventModel.js');

module.exports = {
  createEvent: function(req, res, next) {

    var newEvent = req.body;
    newEvent.timestamp = Date.now();

    Event.create(newEvent, function(err, doc){
      if (err) {
        res.status(400).send(err);
      } else res.send(doc);

    })

  }
}