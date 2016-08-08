var Action = require('./actionModel.js');

function prettyPrint(obj) {
  console.log(JSON.stringify(obj, null , 2));
}

function findClosestTimestamps(original, comparator) {

  var smaller;
  var bigger;
  var isOriginalIdx = false;

  if (original[0].timestamp > comparator[0].timestamp) {
    smalller = comparator;
    bigger = original;
  } else {
    smalller = original;
    bigger = comparator;
    isOriginalIdx = true;
  }

  var minDiff = Infinity;
  var minIdx = -1;
  smalller.forEach(function(element, idx){
    var diff = (element.timestamp - bigger[0].timestamp);

    if (diff < minDiff && diff >= 0) {
      minDiff = diff; 
      minIdx = idx;
    }
  });

  var returnValue = {
    isOriginalIdx: isOriginalIdx,
    minIdx: minIdx,
    minDiff: minDiff
  }

  return returnValue;

}

function costFunction(ideal, actual) {
  return Math.pow((ideal - actual), 2);
}

function costCalculator(original, comparator) {
  // Not summed.

  var cost = [];

  var smalllerIdx = original.length < comparator.length ? original.length : comparator.length;

  for (var i = 0; i < smalllerIdx; i++) {
    console.log(costFunction(original[i].timestamp, comparator[i].timestamp));
    // sqrt (ms) off from target. 
    cost.push({
      diff: costFunction(original[i].timestamp, comparator[i].timestamp),
      head_pitch: costFunction(original[i].head.pitch, comparator[i].head.pitch),
      head_yaw: costFunction(original[i].head.yaw, comparator[i].head.yaw),
      head_roll: costFunction(original[i].head.roll, comparator[i].head.roll)
    });
  }

  return cost;

}

function minimizeArrays (doc, shift) {
  var original   = doc[0],
      comparator = doc[1];

  var closestTimestamps = findClosestTimestamps(original, comparator);

  if (closestTimestamps.isOriginalIdx) {
    original = original.slice(closestTimestamps.minIdx, original.length);
  } else {
    comparator = comparator.slice(closestTimestamps.minIdx, comparator.length);
  }

  comparator = comparator.slice(shift, comparator.length);

  return costCalculator(original, comparator);



}

module.exports = {
  createAction: function(req, res, next) {

    var newAction = req.body;
    newAction.timestamp = Date.now();
    
    prettyPrint(newAction);

    Action.create(newAction, function(err, doc){

      if (err) {
        res.status(400).send(err);
      } else res.sendStatus(200);

    })

  },

  minimize: function(req, res, next) {
    var original = req.query.original;
    var comparator = req.query.comparator;

    // The comparator is shifted.
    var frameShift = req.query.frameShift;
    var byAscendingOrder = {'displayName': -1};

    var comparatorQuery = Action.find({'displayName': comparator}).sort(byAscendingOrder).lean();
    var originalQuery = Action.find({'displayName': original}).sort(byAscendingOrder).lean();
    // Cache these requests
    var start = Date.now()
    Promise.all([originalQuery, comparatorQuery]).then(function(doc){
      var end1 = Date.now();
      var mini = minimizeArrays(doc, frameShift);
      var end2 = Date.now();

      console.log("the query");
      console.log(end1 - start);

      console.log("the calculations")
      console.log(end2 - end1);

      res.status(200).send(mini);      

    }).catch(function(err, doc){
      res.status(400).send(err);
    });

  }
}

