var Action = require('./actionModel.js')();

function prettyPrint(obj) {
  console.log(JSON.stringify(obj, null , 2));
}

module.exports = {
  createAction: function(req, res, next) {

    var newAction = req.body;
    newAction.timestamp = Date.now();

    // prettyPrint(newAction);

    Action.insert(newAction);
    res.sendStatus(200);

  }
}

