var Event = require('./eventModel.js');

function prettyPrint(obj) {
  console.log(JSON.stringify(obj, null , 2));
}

module.exports = {
  createEvent: function(req, res, next) {

    var newEvent = req.body;

    Event.create(newEvent, function(err, doc){
      if (err) {
        res.sendStatus(400);
      } else res.sendStatus(200);

    })

  }
}