var Event = require('../events/eventModel.js');
var Action = require('../actions/actionModel.js');


module.exports = {
  simpleCache: {},

  // A helper that gets a timestamp given an eventName
  getEventTimestampQuery: function(evtName) {

    if (this.simpleCache[evtName]) {
      return Promise.resolve(this.simpleCache[evtName]);
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
  },

  // Gets two timestamps that border actions that the user requests for
  // The isOffsetTimestamp parameter is true when 'offset' isn't a timestamp
  // but what should be subracted from the end time.
  getTimestampQuery: function (timestamp, offset, isOffsetTimestamp) {

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

  },

  // Queries all for two users frames between the timestamp and an offset.
  queryAllFrames: function (user, comparator, timestamp, offset, isOffsetTimestamp) {

    var comparatorFrames = Action.find(
      {
        displayName: comparator,
        timestamp: this.getTimestampQuery(timestamp, offset, isOffsetTimestamp)
      }
    ).lean().exec();

    var userFrames = Action.find(
      {
        displayName: user,
        timestamp: this.getTimestampQuery(timestamp, offset, isOffsetTimestamp)
      }
    ).lean().exec();

    return Promise.all([userFrames, comparatorFrames]);

  },

  // Spreads argument parameters into an array and performs eventTimestampQueries on all of them.
  getMultipleQueries: function(...args) {
    var _this = this;
    var promises = [];
    args.forEach(function(elem) {
      promises.push(_this.getEventTimestampQuery(elem));
    })

    return Promise.all(promises);
  },

}




