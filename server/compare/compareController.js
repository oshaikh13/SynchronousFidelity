var Action = require('../actions/actionModel.js');
var Event = require('../events/eventModel.js');

function threeDimensionalDistance(x1, y1, z1, x2, y2, z2) {
  return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)+(z2-z1)*(z2-z1));
}

function getActionCompareQuery(username, timestamp, sort) {

  var qry = {
    timestamp: {

    },

    displayName: {
      $eq: username
    }
  }

  qry.timestamp[(sort === -1 ? "$lte" : '$gt')] = timestamp;

  return Action
    .find(qry)
    .sort({timestamp: sort})
    .limit(1).exec();
}

function getCloserObject(obj1, obj2, timestamp) {

  console.log("comparing");
  console.log(obj1, obj2, timestamp);

  if (!obj1.length) {
    return obj2;
  }

  if (!obj2.length) {
    return obj1;
  }

  var x = Math.abs(obj1[0].timestamp - timestamp);
  var y = Math.abs(obj2[0].timestamp - timestamp);

  if (x > y) {
    return obj2;
  }

  return obj1;

}

module.exports = {
  distancePoints: function(req, res, next) {

    var firstTimestamp = req.body.firstTimestamp || Date.now(); // given integer
    var seconedTimestamp = firstTimestamp - req.body.msOffset;

    // Origin
    var closestBelowUser = getActionCompareQuery(req.body.username, firstTimestamp, -1);
    var closestAboveUser = getActionCompareQuery(req.body.username, firstTimestamp, 1);

    var closestBelowComparator = getActionCompareQuery(req.body.comparator, firstTimestamp, -1)
    var closestAboveComparator = getActionCompareQuery(req.body.comparator, firstTimestamp, 1);


    // offset
    var closestBelowUserOffset = getActionCompareQuery(req.body.username, seconedTimestamp, -1);
    var closestAboveUserOffset = getActionCompareQuery(req.body.username, seconedTimestamp, 1);

    var closestBelowComparatorOffset = getActionCompareQuery(req.body.comparator, seconedTimestamp, -1)
    var closestAboveComparatorOffset = getActionCompareQuery(req.body.comparator, seconedTimestamp, 1);


    var promises = [
      closestBelowUser, 
      closestAboveUser, 
      closestBelowComparator, 
      closestAboveComparator,
      closestBelowUserOffset,
      closestAboveUserOffset,
      closestBelowComparatorOffset,
      closestAboveComparatorOffset
    ];


    // Makeshift promise.all
    var fulfilled = 0;

    var completedPromise = [0, 0, 0, 0, 0, 0, 0, 0]; 

    promises.forEach(function(promise, idx){

      promise.then(function(doc){
        fulfilled++;
        completedPromise[idx] = doc;

        if (fulfilled === promises.length) {

          var closestUser = getCloserObject(completedPromise[0], completedPromise[1], firstTimestamp);
          var closestComparator = getCloserObject(completedPromise[2], completedPromise[3], firstTimestamp);
          var closestUserOffset = getCloserObject(completedPromise[4], completedPromise[5], seconedTimestamp);
          var closestComparatorOffset = getCloserObject(completedPromise[6], completedPromise[7], seconedTimestamp);
          res.send([closestUser, closestComparator, closestUserOffset, closestComparatorOffset]);

        }
      });

    })

    // First compare to yourself.

    // Then get the other person, and compare him to himself

    // Then compare to someone else

    // This only gets the point at one stamp.
  }
}

