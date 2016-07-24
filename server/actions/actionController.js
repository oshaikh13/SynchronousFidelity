var Action = require('./actionModel.js');

function prettyPrint(obj) {
  console.log(JSON.stringify(obj, null , 2));
}

module.exports = {
  createAction: function(req, res, next) {

    var newAction = req.body;
    prettyPrint(newAction);

    Action.create(newAction, function(err, doc){

      if (err) {
        res.sendStatus(400);
      } else res.sendStatus(200);

    })

  }
}

