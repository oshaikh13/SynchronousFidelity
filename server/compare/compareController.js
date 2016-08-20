var Action = require('../actions/actionModel.js');
var Event = require('../events/eventModel.js');

var simpleCache = {

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


function getEventTimestampQuery(evtName) {

  function fakePromise (resolveValue) {
    return {
      then: function(cb){
        cb(resolveValue);
      }
    }
  }

  if (simpleCache[evtName]) {
    return fakePromise(simpleCache[evtName]);
  } else if (evtName) {

    var qry = {
      eventName: {
        $eq: evtName
      }
    }

    return Event
      .find(qry)
      .limit(1).exec();
  }

  return fakePromise(null)
  
}

module.exports = {
  eventTimestamp: function(req, res, next) {
    getEventTimestampQuery(req.query.evt).then(function(doc){
      res.status(200).send(doc);
    }).catch(function(err){
      res.status(400).send(err);
    })
  },

  distancePoints: function(req, res, next) {


    getEventTimestampQuery(req.query.evt).then(function(foundEvt){

      if (!simpleCache[req.query.evt]){
        simpleCache[req.query.evt] = foundEvt;
      }

      if (!foundEvt) foundEvt = [{}];

      var evtStamp = foundEvt[0].timestamp;

      if (req.query.evtOffset) {
        evtStamp += parseInt(req.query.evtOffset);
      } 
      

      var firstTimestamp = req.query.firstTimestamp || evtStamp || Date.now(); // given integer
      var seconedTimestamp = firstTimestamp - req.query.msOffset;

      // Origin
      var closestBelowUser = getActionCompareQuery(req.query.username, firstTimestamp, -1);
      var closestAboveUser = getActionCompareQuery(req.query.username, firstTimestamp, 1);

      var closestBelowComparator = getActionCompareQuery(req.query.comparator, firstTimestamp, -1)
      var closestAboveComparator = getActionCompareQuery(req.query.comparator, firstTimestamp, 1);


      // offset
      var closestBelowUserOffset = getActionCompareQuery(req.query.username, seconedTimestamp, -1);
      var closestAboveUserOffset = getActionCompareQuery(req.query.username, seconedTimestamp, 1);

      var closestBelowComparatorOffset = getActionCompareQuery(req.query.comparator, seconedTimestamp, -1)
      var closestAboveComparatorOffset = getActionCompareQuery(req.query.comparator, seconedTimestamp, 1);


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
            res.send({
              closestUser: closestUser[0],
              closestComparator: closestComparator[0],
              closestUserOffset: closestUserOffset[0],
              closestComparatorOffset: closestUser[0]
            });

          }
        });

      });

    })

  }
}

