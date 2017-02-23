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

  },

  getEvents: function(req, res, next) {

    var query = {};

    // The '+' operator converts a string to an integer
    if (+req.query.t1 && +req.query.t2) 
      query["timestamp"] = { $gte: +req.query.t1, $lte: +req.query.t2};

    if (req.query.searchTerms) 
      query["eventName"] = { "$regex": req.query.searchTerms, "$options": "i" };

    Event.find(query, function(err, doc) {
      if (err) res.status(400).send(err);
      else res.send(doc);
    })

  }
}