var Action = require('../actions/actionModel.js')();
var Event = require('../events/eventModel.js')();
var compareUtils = require('./compareUtils.js')

function getEventTimestampQuery(evtName) {
  if (!evtName) return null;

  var qry = {
    eventName: {
      $eq: evtName
    }
  }

  return Event
    .findOne(qry)

}

function queryAllFrames (user, comparator, timestamp, offset) {

  // Meant to handle a negative offset.
  // We can't query biggerNum < x < smallerNum
  function getTimestampQuery (timestamp, offset) {
    if (offset < 0) {
      return {
        '$gte': timestamp, 
        '$lte': timestamp - offset
      }
    } else return {
      '$gte': timestamp - offset, 
      '$lte': timestamp      
    }
  }


  var limits = getTimestampQuery(timestamp, offset);

  var comparatorFrames = Action.where(function(doc){
    return (
      doc.displayName === comparator && 
      doc.timestamp <= limits['$lte'] && 
      doc.timestamp >= limits['$gte']
    );
  })


  var userFrames = Action.where(function(doc){
    return (
      doc.displayName === user && 
      doc.timestamp <= limits['$lte'] && 
      doc.timestamp >= limits['$gte']
    );
  })


  return {
    userFrames: userFrames,
    comparatorFrames: comparatorFrames
  };

}


function sumFrameDistances (personA, personB) {

  // TODO: Add this obj to the frame so we can align it later.
  function interval (start, end) {
    var obj = {};
    obj.start = start;
    obj.end = end;
  }

  function getDistanceSum (frame1, frame2) {


    var frame1LeftHand = frame1.hands.leftHand.position;
    var frame2LeftHand = frame2.hands.leftHand.position;

    var distLeftHand = compareUtils
                        .threeDimensionalDistance(frame1LeftHand, frame2LeftHand);

    var frame1RightHand = frame1.hands.rightHand.position;
    var frame2RightHand = frame2.hands.rightHand.position;

    var distRightHand = compareUtils
                        .threeDimensionalDistance(frame1RightHand, frame2RightHand);

    var frame1Head = frame1.head.position;
    var frame2Head = frame2.head.position;

    var distHead = compareUtils
                        .threeDimensionalDistance(frame1Head, frame2Head);

    return distHead + distLeftHand + distRightHand; // You don't have to "sum" them.

  }

  function dualFrameMap (person, cb) {
    var newArr = [];
    for (var i = 0; i < person.length - 1; i++) {
      var frame1 = person[i];
      var frame2 = person[i + 1];
      newArr.push(cb(frame1, frame2));
    }

    return newArr;
  }

  var distancePersonA = 0;
  var personADistances = dualFrameMap(personA, function(frame1, frame2) {
    var distMoved = getDistanceSum(frame1, frame2);
    distancePersonA += distMoved;
    return distMoved;
  });

  var distancePersonB = 0;
  var personBDistances = dualFrameMap(personB, function(frame1, frame2) {
    var distMoved = getDistanceSum(frame1, frame2);
    distancePersonB += distMoved;
    return distMoved;
  });

  // console.log(distancePersonA, distancePersonB);

  return {
    R: compareUtils.getPearsonCorrelation(personADistances, personBDistances),
    distancePersonA: distancePersonA,
    distancePersonB: distancePersonB
  };

}

module.exports = {
  eventTimestamp: function(req, res, next) {
    getEventTimestampQuery(req.query.evt).then(function(doc){
      res.status(200).send(doc);
    }).catch(function(err){
      res.status(400).send(err);
    })
  },

  rCorrelation: function(req, res, next) {

    // Only runs when EVT is passed.


    if (!req.query.timestamp) {
      req.query.timestamp = Date.now();
    }

    if (!req.query.offset) {
      req.query.offset = 500; //ms
    } else {
      // + in front of an string casts it into an int. yay
      req.query.offset = +req.query.offset;
    }



    if (isNaN(req.query.offset)) {
      res.status(400).send("Illegal params");
      return;
    }

    if (!req.query.timestamp || !req.query.offset || !req.query.username || !req.query.comparator) {
      res.status(400).send("Illegal params");
      return;
    }

    var evtCollection = getEventTimestampQuery(req.query.evt);

    if (evtCollection) {
      req.query.timestamp = evtCollection.timestamp;
    }

    var allFrames = queryAllFrames(req.query.username, req.query.comparator, req.query.timestamp, req.query.offset);

    var result = sumFrameDistances(allFrames.userFrames, allFrames.comparatorFrames);

    var personALastFrame;
    var personBLastFrame;

    if (allFrames.userFrames[0] && allFrames.comparatorFrames[0]) {
      personALastFrame = allFrames.userFrames[allFrames.userFrames.length - 1].head.position;
      personBLastFrame = allFrames.comparatorFrames[allFrames.comparatorFrames.length - 1].head.position;
    } else {

      var nothing = {
        x: 0,
        y: 0,
        z: 0
      }

      personALastFrame = nothing;
      personBLastFrame = nothing;
      
    }

    res.status(200).send(
      {
        distanceUserMoved: result.distancePersonA,
        distanceComparatorMoved: result.distancePersonB,
        R: result.R,
        distanceBetweenUsers: compareUtils.threeDimensionalDistance(personALastFrame, personBLastFrame)
      }
    );

  }

}

