var Action = require('../actions/actionModel.js');
var Event = require('../events/eventModel.js');


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

  console.log(arguments);

  var comparatorFrames = Action.find(
    {
      displayName: comparator,
      timestamp: 
        {
          $gte: timestamp - offset, 
          $lte: timestamp
        }
    }
  ).exec();

  var userFrames = Action.find(
    {
      displayName: user,
      timestamp: 
        {
          $gte: timestamp - offset, 
          $lte: timestamp
        }
    }
  ).exec();

  return Promise.all([userFrames, comparatorFrames]);

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
      // + in front of an integer converts it into an int! yay
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
      res.status(200).send(resolvedValue);
    }).catch(function(err){
      res.status(400).send(err);
    });

  }

}

// TODO:
// 1. Find distance diffs between each frame
// 2. Run some sort of R correleation. (However, we may have a larger/smaller dataset in the pair...)













