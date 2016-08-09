var Action = require('../actions/actionModel.js');
var Event = require('../events/eventModel.js');

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
  return Math.abs((ideal - actual));
}

function costCalculator(original, comparator) {
  // Not summed.

  var cost = [];

  cost.push(['comparator_stamp']);
  // cost.push(['head_yaw']);
  // cost.push(['head_pitch']);
  // cost.push(['head_roll']);

  // TODO: Write a function that does this when simply providing keys
  cost.push(['left_hand_pitch']);
  cost.push(['left_hand_yaw']);
  cost.push(['left_hand_roll']);

  var smalllerIdx = original.length < comparator.length ? original.length : comparator.length;

  for (var i = 0; i < smalllerIdx; i++) {
    // console.log(costFunction(original[i].timestamp, comparator[i].timestamp));
    // sqrt (ms) off from target. 

    // c3charts format
    cost[0].push(comparator[i].timestamp);
    // cost[1].push(costFunction(original[i].head.pitch, comparator[i].head.pitch));
    // cost[2].push(costFunction(original[i].head.yaw, comparator[i].head.yaw));
    // cost[3].push(costFunction(original[i].head.roll, comparator[i].head.roll));

    cost[1].push(costFunction(original[i].hands.leftHand.pitch, comparator[i].hands.leftHand.pitch));
    cost[2].push(costFunction(original[i].hands.leftHand.yaw, comparator[i].hands.leftHand.yaw));
    cost[3].push(costFunction(original[i].hands.leftHand.roll, comparator[i].hands.leftHand.roll));
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

function queryActions (req, res, next, evt) {

  var original = req.query.original;
  var comparator = req.query.comparator;

  var comparatorLimit = req.query.comparatorLimit;
  var comparatorSkip = req.query.comparatorSkip;

  var originalLimit = req.query.originalLimit;
  var originalSkip = req.query.originalSkip;

  var limit = req.query.limit;
  var skip = req.query.skip;

  if (limit) {
    originalLimit = limit;
    comparatorLimit = limit;
  }

  if (skip) {
    originalSkip = skip;
    comparatorSkip = skip;
  }

  // The comparator is shifted.
  var frameShift = req.query.frameShift;
  var byAscendingOrder = {'displayName': -1};

  var comparatorQuery = Action.find({'displayName': comparator});
  var originalQuery = Action.find({'displayName': original});

  if (evt) {
    comparatorQuery.where('timestamp').gt(evt.timestamp);
    originalQuery.where('timestamp').gt(evt.timestamp);
  }

  if (comparatorLimit) {
    comparatorQuery.limit(comparatorLimit);
  }

  if (comparatorSkip) {
    comparatorQuery.skip(comparatorSkip);
  }


  if (originalLimit) {
    originalQuery.limit(originalLimit);
  }

  if (originalSkip) {
    originalQuery.skip(originalSkip);
  }

  comparatorQuery.sort(byAscendingOrder);
  originalQuery.sort(byAscendingOrder);

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

module.exports = {
  minimize: function(req, res, next) {

    var _this = this;
    // Query based on an event
    var evt = req.query.evt;

    if (evt) {
      Event.findOne({"eventName": evt}).then(function(doc){
        queryActions.call(_this, req, res, next, doc);
      }).catch(function(e){
        res.status(400).send(e);
      })

    } else queryActions.call(_this, req, res, next, null);

  }
}