var Action = require('../actions/actionModel.js');
var ActionCache = require('../actions/actionCache.js');

var Event = require('../events/eventModel.js');
var compareUtils = require('./compareUtils.js')

var json2csv = require('json2csv');

var simpleCache = {};

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
      .limit(1).lean().exec();
  }

  return Promise.resolve(null);
  
}

// Meant to handle a negative offset.
// We can't query biggerNum < x < smallerNum
function getTimestampQuery (timestamp, offset, isOffsetTimestamp) {

  if (isOffsetTimestamp) {
    return {
      $gte: timestamp, 
      $lte: offset
    }
  }

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

function queryAllFrames (user, comparator, timestamp, offset, isOffsetTimestamp) {

  var comparatorFrames = Action.find(
    {
      displayName: comparator,
      timestamp: getTimestampQuery(timestamp, offset, isOffsetTimestamp)
    }
  ).lean().exec();

  var userFrames = Action.find(
    {
      displayName: user,
      timestamp: getTimestampQuery(timestamp, offset, isOffsetTimestamp)
    }
  ).lean().exec();

  return Promise.all([userFrames, comparatorFrames]);

}


function prettyPrint(obj) {
  console.log(JSON.stringify(obj, null , 2));
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

    if (person === undefined || person.length === 0 || person.length === 1) return newArr;

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

  return {
    R: compareUtils.getPearsonCorrelation(personADistances, personBDistances),
    distancePersonA: distancePersonA,
    distancePersonB: distancePersonB
  };

}

// TODO: See the similarities between raw and cache? Abstract away...

function rawDataHandler (username, comparator, t1, t2, chunks, cb) {

  if (t1 > t2) {
    cb("timestamp/event 2 should come later than timestamp/event 1");
    return;
  }

  queryAllFrames(username, comparator, t1, t2, true).then(function(resolvedValue){

    var chunkUsers = compareUtils.chunkify(resolvedValue[0], chunks);
    var chunkComparators = compareUtils.chunkify(resolvedValue[1], chunks);

    var results = {
      data: []
    };

    for (var i = 0; i < chunks; i++) {

      var rCorrelationData = sumFrameDistances(chunkUsers[i], chunkComparators[i]);
      rCorrelationData.chunkNum = i + 1;
      results.data.push(rCorrelationData);


    }

    results.totalTime = t2 - t1;
    results.chunkTime = results.totalTime/chunks;
    results.completionTime = Date.now();
    
    cb(results);

  });
}

function cacheDataHandler (username, comparator, t1, t2, chunks, cb) {
  if (t1 > t2) {
    cb("timestamp/event 2 should come later than timestamp/event 1");
    return;
  }

  var resolvedValues = ActionCache.get(username, comparator, t1, t2);

  var chunkUsers = compareUtils.chunkify(resolvedValues[0], chunks);
  var chunkComparators = compareUtils.chunkify(resolvedValues[1], chunks);

  var results = {
    data: []
  };

  for (var i = 0; i < chunks; i++) {

    var rCorrelationData = sumFrameDistances(chunkUsers[i], chunkComparators[i]);
    rCorrelationData.chunkNum = i + 1;
    results.data.push(rCorrelationData);


  }

  results.totalTime = t2 - t1;
  results.chunkTime = results.totalTime/chunks;
  results.completionTime = Date.now();
  
  cb(results);


}

function csvDataHandler(username, comparator, t1, t2, chunks, cb) {

  if (t1 > t2) {
    cb("timestamp/event 2 should come later than timestamp/event 1");
    return;
  }
    
  Action.find({
    timestamp: getTimestampQuery(t1, t2, true)
  }).lean().exec(function (err, actions) {

    if (err) {
      cb("Error querying database");
      return;
    };

    json2csv({ data: actions, fields: compareUtils.actionFields() }, function(err, csv){
      cb(csv);
    });

  });

}


function generalDataQuery(req, res, next, handler) {
  if (process.env.LOGS) {
    console.log("GETTING DATA REQUEST");
  }

  var chunks = +req.query.chunks;

  if (!req.query.evt1 && !req.query.evt2 && !req.query.t1 && !req.query.t2) {
    req.query.t2 = Date.now();
    req.query.t1 = req.query.offset ? (req.query.t2 - (+req.query.offset)) : (req.query.t2 - 8000);
  }

  if (req.query.evt1 && req.query.evt2) {

    Promise.all([getEventTimestampQuery(req.query.evt1), getEventTimestampQuery(req.query.evt2)])
    .then(function (resolvedValues){

      if (resolvedValues[0] && resolvedValues[1] && resolvedValues[0][0] && resolvedValues[1][0]) {

        if (!simpleCache[resolvedValues[0][0].eventName]){
          simpleCache[resolvedValues[0][0].eventName] = resolvedValues[0][0];
        }

        if (!simpleCache[resolvedValues[1][0].eventName]){
          simpleCache[resolvedValues[1][0].eventName] = resolvedValues[1][0];
        }

        var t1 = resolvedValues[0][0].timestamp;
        var t2 = resolvedValues[1][0].timestamp;

        handler(req.query.username, req.query.comparator, t1, t2, chunks, function(data){
          res.send(data);
        });

      } else res.send("Can't find a provided event");
    })

  } else if (req.query.t1 && req.query.t2) {
    var t2 = +req.query.t2;
    var t1 = +req.query.t1;


    if (req.query.cache) handler = cacheDataHandler;

    handler(req.query.username, req.query.comparator, t1, t2, chunks, function(data){
      res.send(data);
    });

  } else res.status(400).send("Bad request.")
}

module.exports = {
  eventTimestamp: function(req, res, next) {
    getEventTimestampQuery(req.query.evt).then(function(doc){
      res.status(200).send(doc);
    }).catch(function(err){
      res.status(400).send(err);
    })
  },


  rawdata: function(req, res, next) {
    generalDataQuery(req, res, next, rawDataHandler);
  },

  csvdata: function(req, res, next) {
    var filename = 'data.csv';
    res.attachment(filename);
    generalDataQuery(req, res, next, csvDataHandler);
  }

}



