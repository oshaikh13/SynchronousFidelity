// A set of HTTP handlers that return appropriate responses based on requests.

var json2csv = require('json2csv');

var compareQueries = require('./compareQueries.js');
var compareUtils = require('./compareUtils.js');
var ActionCache = require('../actions/actionCache.js');
var Action = require('../actions/actionModel.js');


module.exports = {

  // Handles raw data requests, in a JSON file format.
  // Pulls data from the database instead of a cache.
  // Look at cacheDataHandler for caching functions.
  rawDataHandler: function (username, comparator, t1, t2, chunks, cb) {
    if (t1 > t2) {
      cb("timestamp/event 2 should come later than timestamp/event 1");
      return;
    }

    compareQueries.queryAllFrames(username, comparator, t1, t2, true).then(function(resolvedValue){
      cb(compareUtils.rProccessor(resolvedValues, chunks, t2, t1));
    });

  },

  // Pulls data from an actionCache that contains actions from some seconds ago
  // Check actions/actionCache.js for more info
  cacheDataHandler: function (username, comparator, t1, t2, chunks, cb) {
    if (t1 > t2) {
      cb("timestamp/event 2 should come later than timestamp/event 1");
      return;
    }

    var resolvedValues = ActionCache.get(username, comparator, t1, t2);

    cb(compareUtils.rProccessor(resolvedValues, chunks, t2, t1));
    
  },

  // Pulls data from the database and returns it in a CSV file format.
  csvDataHandler: function (username, comparator, t1, t2, chunks, cb) {
    if (t1 > t2) {
      cb("timestamp/event 2 should come later than timestamp/event 1");
      return;
    }
      
    let queryTimestamp = compareQueries.getTimestampQuery(t1, t2, true);

    Action.find({
      timestamp: queryTimestamp
    }).lean().exec(function (err, actions) {

      if (err) {
        cb("Error querying database");
        return;
      };

      json2csv({ data: actions, fields: compareUtils.actionFields() }, function(err, csv){
        cb(csv);
      });

    });
  },

}


