var Action = require('../actions/actionModel.js');
var Event = require('../events/eventModel.js');
var compareUtils = require('./compareUtils.js')

// If I were to over-engineer this, I'd add Redis here :p
var simpleCache = {

}


function getEventTimestampQuery(evtName) {

  if (simpleCache[evtName]) {
    return Promise.resolve(simpleCache[evtName]);
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

  return Promise.resolve(null);
  
}

function queryAllFrames (user, comparator, timestamp, offset, cb) {

  // Meant to handle a negative offset.
  // We can't query biggerNum < x < smallerNum
  function getTimestampQuery (timestamp, offset) {
    if (offset < 0) {
      return {
        $gte: timestamp, 
        $lte: timestamp - offset
      }
    } else return {
      $gte: timestamp - offset, 
      $lte: timestamp      
    }
  }

  var comparatorFrames = Action.find(
    {
      displayName: comparator,
      timestamp: getTimestampQuery(timestamp, offset)
    }
  ).exec();

  var userFrames = Action.find(
    {
      displayName: user,
      timestamp: getTimestampQuery(timestamp, offset)
    }
  ).exec();

  return Promise.all([userFrames, comparatorFrames]);

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

  var personADistances = dualFrameMap(personA, function(frame1, frame2){
    return getDistanceSum(frame1, frame2);
  })

  var personBDistances = dualFrameMap(personB, function(frame1, frame2){
    return getDistanceSum(frame1, frame2);
  });

  return compareUtils.getPearsonCorrelation(personADistances, personBDistances);

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

    getEventTimestampQuery(req.query.evt).then(function(foundEvt){

      if (!simpleCache[req.query.evt]){
        simpleCache[req.query.evt] = foundEvt;
      }

      if (foundEvt) {
        req.query.timestamp = foundEvt[0].timestamp;
      }


      return queryAllFrames(req.query.username, req.query.comparator, req.query.timestamp, req.query.offset);


    }).then(function(resolvedValue){

      var R = sumFrameDistances(resolvedValue[0], resolvedValue[1]);

      res.status(200).send({R: R});

    }).catch(function(err){
      res.status(400).send(err);
    });

  }

}

// TODO:
// 1. Find distance diffs between each frame
// 2. Run some sort of R correleation. (However, we may have a larger/smaller dataset in the pair...)













