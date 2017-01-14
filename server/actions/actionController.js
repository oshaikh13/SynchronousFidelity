var Action = require('./actionModel.js');
var ActionCache = require('./actionCache.js');

function prettyPrint(obj) {
  console.log(JSON.stringify(obj, null , 2));
}

module.exports = {
  createAction: function(req, res, next) {

    if (process.env.LOGS) {
      console.log("GETTING ACTION CREATE REQUEST");

    }

    var newAction = req.body;
    newAction.timestamp = Date.now();

    // prettyPrint(newAction);
    Action.create(newAction, function(err, doc){

      if (err) {
        res.status(400).send(err);
      } else res.sendStatus(200);

    });

    ActionCache.add(newAction);

  },


}

