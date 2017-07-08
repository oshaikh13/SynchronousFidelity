var Action = require('../actions/actionModel.js');
var ActionCache = require('../actions/actionCache.js');

var Event = require('../events/eventModel.js');
var compareUtils = require('./compareUtils.js');
var compareHandlers = require('./compareHandlers.js');
var compareQueries = require('./compareQueries.js');

var DEFAULT_OFFSET = 3000; // the number of seconds for the offset window to compare sycnhrony 
                           // this is what you want to change if the offset should be larger/smaller

// Takes a data handler from each HTTP request, and deals with it appropriately. 
function generalDataQuery(req, res, next, handler) {

  // Converts the chunks URL parameter into an integer. The + notation denotes string to int conversion.
  // This helps when trying to find R correlations in a LONG interaction.
  // If the space between t1 and t2 is large, what's the point in finding the entire sychrony score
  // We can split the interaction into 'chunks' and find R for each equally spaced chunk.
  // By default, the number of chunks on the live tracker is 1, since t2 - t1 is small.
  var chunks = +req.query.chunks;

  // If we're missing events or timestamps, simply take the current time as t2,
  // and take an offset (3 secs default) back as t2
  if (!req.query.evt1 && !req.query.evt2 && !req.query.t1 && !req.query.t2) {
    req.query.t2 = Date.now();
    req.query.t1 = req.query.offset ? (req.query.t2 - (+req.query.offset)) : (req.query.t2 - DEFAULT_OFFSET);
  }

  // If we have events, we need to convert them to timestamps...
  if (req.query.evt1 && req.query.evt2) {

    // Fetches data for two events by converting the event tags to timestamps
    compareQueries.getMultipleQueries(req.query.evt1, req.query.evt2)
    .then(function (resolvedValues){

      // Makes sure the events exist, or the response from the database is invalid
      if (compareUtils.deepExists(resolvedValues)) {

        // The getmultipleQueries looks for events in a cache, so we don't need to hit the database

        // This stores the event with a timestamp, in that cache, so we don't need to go back and 
        // fetch the timestamps paird with events. 

        // This 'simpleCache' is different from the actionCache. It stores events, not movement data!
        if (!compareQueries.simpleCache[resolvedValues[0][0].eventName]){
          compareQueries.simpleCache[resolvedValues[0][0].eventName] = resolvedValues[0][0];
        }

        if (!compareQueries.simpleCache[resolvedValues[1][0].eventName]){
          compareQueries.simpleCache[resolvedValues[1][0].eventName] = resolvedValues[1][0];
        }

        var t1 = resolvedValues[0][0].timestamp;
        var t2 = resolvedValues[1][0].timestamp;


        // This cache parameter is not for event caching, but for actual action movement caching.
        // This is particularly useful when handling live R correlation data, as multiple requests
        // to a database can be "slow"
        if (req.query.cache) handler = cacheDataHandler;

        handler(req.query.username, req.query.comparator, t1, t2, chunks, function(data){
          res.send(data);
        });

      } else res.send("Can't find a provided event");
    })

  } else if (req.query.t1 && req.query.t2) {

    // Simply convert timestamps to numbers, and send a request for data
    var t2 = +req.query.t2;
    var t1 = +req.query.t1;

    if (req.query.cache) handler = compareHandlers.cacheDataHandler;

    handler(req.query.username, req.query.comparator, t1, t2, chunks, function(data){
      res.send(data);
    });

  } else res.status(400).send("Bad request.");

}


module.exports = {
  eventTimestamp: function(req, res, next) {
    compareQueries.getEventTimestampQuery(req.query.evt).then(function(doc){
      res.status(200).send(doc);
    }).catch(function(err){
      res.status(400).send(err);
    })
  },


  rawdata: function(req, res, next) {
    generalDataQuery(req, res, next, compareHandlers.rawDataHandler);
  },

  csvdata: function(req, res, next) {
    var filename = 'data.csv';
    res.attachment(filename);
    generalDataQuery(req, res, next, compareHandlers.csvDataHandler);
  }

}



