// Utilities that requests synchrony requests depend upon.

module.exports = {

  // Tinker with this method to find different means of syncrhony
  sycnhronyCalculator: function (personA, personB) {
    var _this = this;

    // TODO: Add this obj to the frame so we can align it. 
    // Not really needed since frames are usually aligned closely.
    function interval (start, end) {
      var obj = {};
      obj.start = start;
      obj.end = end;
    }

    function getDistanceSum (frame1, frame2) {


      var frame1LeftHand = frame1.hands.leftHand.position;
      var frame2LeftHand = frame2.hands.leftHand.position;

      var distLeftHand = _this
                          .threeDimensionalDistance(frame1LeftHand, frame2LeftHand);

      var frame1RightHand = frame1.hands.rightHand.position;
      var frame2RightHand = frame2.hands.rightHand.position;

      var distRightHand = _this
                          .threeDimensionalDistance(frame1RightHand, frame2RightHand);

      var frame1Head = frame1.head.position;
      var frame2Head = frame2.head.position;

      var distHead = _this
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
      R: _this.getPearsonCorrelation(personADistances, personBDistances),
      distancePersonA: distancePersonA,
      distancePersonB: distancePersonB
    };

  },


  deepExists: function (resolvedValues) {
    return resolvedValues[0] && resolvedValues[1] && resolvedValues[0][0] && resolvedValues[1][0];
  },

  // Splits an array into 'a' chunks of size 'n'.
  chunkify: function(a, n, balanced) {

    if (n < 2)
      return [a];

    var len = a.length,
      out = [],
      i = 0,
      size;

    if (len % n === 0) {
      size = Math.floor(len / n);
      while (i < len) {
        out.push(a.slice(i, i += size));
      }
    } else if (balanced) {
      while (i < len) {
        size = Math.ceil((len - i) / n--);
        out.push(a.slice(i, i += size));
      }
    } else {

      n--;
      size = Math.floor(len / n);
      if (len % size === 0)
        size--;
      while (i < size * n) {
        out.push(a.slice(i, i += size));
      }
      out.push(a.slice(size * n));

    }

    return out;
  },



  // Takes two points with x, y, z props and find the distance
  threeDimensionalDistance: function (o1, o2) {
    return Math.sqrt((o2.x-o1.x)*(o2.x-o1.x)+(o2.y-o1.y)*(o2.y-o1.y)+(o2.z-o1.z)*(o2.z-o1.z));
  },

  rProccessor: function(resolvedValue, chunks, t2, t1) {

    var chunkUsers = this.chunkify(resolvedValue[0], chunks);
    var chunkComparators = this.chunkify(resolvedValue[1], chunks);

    var results = {
      data: []
    };

    for (var i = 0; i < chunks; i++) {

      var rCorrelationData = this.sycnhronyCalculator(chunkUsers[i], chunkComparators[i]);
      rCorrelationData.chunkNum = i + 1;
      results.data.push(rCorrelationData);


    }

    results.totalTime = t2 - t1;
    results.chunkTime = results.totalTime/chunks;
    results.completionTime = Date.now();

    return results;
  },


  /*
  * Shamefully ripped off R correlator from Steve Gardner 
  * Thank you!
  *
  * Considers each element from an array as a point
  *
  * (x, y) coordinate = (x[0], y[0])
  * A line is drawn through these coordinates, and the R value is returned.
  *
  */

  getPearsonCorrelation: function (x, y) {
    
    var shortestArrayLength = 0;
     
    if(x.length == y.length) {
        shortestArrayLength = x.length;
    } else if(x.length > y.length) {
        shortestArrayLength = y.length;
        // console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
        shortestArrayLength = x.length;
        // console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
    }
  
    var xy = [];
    var x2 = [];
    var y2 = [];
  
    for(var i=0; i<shortestArrayLength; i++) {
        xy.push(x[i] * y[i]);
        x2.push(x[i] * x[i]);
        y2.push(y[i] * y[i]);
    }
  
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_x2 = 0;
    var sum_y2 = 0;
  
    for(var i=0; i< shortestArrayLength; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += xy[i];
        sum_x2 += x2[i];
        sum_y2 += y2[i];
    }
  
    var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
    var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
    var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
    var step4 = Math.sqrt(step2 * step3);
    var answer = step1 / step4;
  
    return answer;
    
  },

  // These are fields used for the JSON csv parsing library.
  // Lets the parser know what fields should be added to the CSV files
  // so it can find it in the object returned from mongodb.

  actionFields: function() {
    return [
      'timestamp',
      'displayName',
      'head.pitch',
      'head.yaw', 
      'head.roll',
      'body.pitch',
      'body.yaw', 
      'body.roll',
      'head.position.x',
      'head.position.y',
      'head.position.z',
      'hands.leftHand.pitch',
      'hands.leftHand.yaw', 
      'hands.leftHand.roll',
      'hands.leftHand.position.x',
      'hands.leftHand.position.y',
      'hands.leftHand.position.z',
      'hands.rightHand.pitch',
      'hands.rightHand.yaw', 
      'hands.rightHand.roll',
      'hands.rightHand.position.x',
      'hands.rightHand.position.y',
      'hands.rightHand.position.z',
      'palms.leftPalm.pitch',
      'palms.leftPalm.yaw', 
      'palms.leftPalm.roll',
      'palms.leftPalm.position.x',
      'palms.leftPalm.position.y',
      'palms.leftPalm.position.z',
      'palms.rightPalm.pitch',
      'palms.rightPalm.yaw', 
      'palms.rightPalm.roll',
      'palms.rightPalm.position.x',
      'palms.rightPalm.position.y',
      'palms.rightPalm.position.z'
    ];
  },

  eventFields: function () {
   return [
      'eventName',
      'timestamp'
    ];
  }
  
}
