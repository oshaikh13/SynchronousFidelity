var Action = require('./actionModel.js');
var ActionCache = require('./actionCache.js');

module.exports = {
  createAction: function(req, res, next) {


    var newAction = req.body;
    newAction.timestamp = Date.now();
    
    ActionCache.add(newAction);

    // prettyPrint(newAction);
    Action.create(newAction, function(err, doc){

      if (err) {
        res.status(400).send(err);
      } else {
        res.sendStatus(200);
      } 

    });


  },


}

