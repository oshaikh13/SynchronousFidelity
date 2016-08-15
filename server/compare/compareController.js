var Action = require('../actions/actionModel.js');
var Event = require('../events/eventModel.js');

function threeDimensionalDistance(x1, y1, z1, x2, y2, z2) {
  return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)+(z2-z1)*(z2-z1));
}

function getActionCompareQuery(username, timestamp, sort) {
  return Action
    .find(
      {
        timestamp: {
          $lte: timestamp
        },

        username: {
          $eq: username
        }
      }
    )
    .sort({timestamp: sort})
    .limit(1);;
}

function getCloserObject(obj1, obj2, timestamp) {
  var x = Math.abs(obj1.timestamp - timestamp);
  var y = Math.abs(obj2.timestamp - timestamp);

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
    var closestAboveUser = getActionCompareQuery(req.body.username, firstTimestamp, 1)

    var closestBelowComparator = getActionCompareQuery(req.body.comparator, firstTimestamp, -1)
    var closestAboveComparator = getActionCompareQuery(req.body.comparator, firstTimestamp, 1)


    // offset
    var closestBelowUserOffset = getActionCompareQuery(req.body.username, seconedTimestamp, -1);
    var closestAboveUserOffset = getActionCompareQuery(req.body.username, seconedTimestamp, 1)

    var closestBelowComparatorOffset = getActionCompareQuery(req.body.comparator, seconedTimestamp, -1)
    var closestAboveComparatorOffset = getActionCompareQuery(req.body.comparator, seconedTimestamp, 1)


    Promise.all(
      [
        closestAboveUser, 
        closestBelowUser, 
        closestAboveComparator, 
        closestBelowComparator,
        closestBelowUserOffset,
        closestAboveUserOffset,
        closestAboveComparatorOffset,
        closestBelowComparatorOffset
      ], function(resolvedArray){

        var closestUser = getCloserObject(resolvedArray[0], resolvedArray[1], firstTimestamp);
        var closestComparator = getCloserObject(resolvedArray[2], resolvedArray[3], firstTimestamp);
        var closestUserOffset = getCloserObject(resolvedArray[4], resolvedArray[5], seconedTimestamp);
        var closestComparatorOffset = getCloserObject(resolvedArray[6], resolvedArray[7], seconedTimestamp);

        res.send([closestUser, closestComparator, closestUserOffset, closestComparatorOffset]);

    })
    // First compare to yourself.

    // Then get the other person, and compare him to himself

    // Then compare to someone else

    // This only gets the point at one stamp.
  }
}

