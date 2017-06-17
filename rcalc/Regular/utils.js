// Utilities that requests synchrony requests depend upon.
module.exports = {

  SHIFTING_THRESHOLD: 300,
  // Tinker with this method to find different means of syncrhony
  synchronyCalculator: function(personA, personB) {
    var _this = this;

    function getDistanceSum(frame1, frame2) {


      var frame1LeftHand = {
        x: parseFloat(frame1['hands.leftHand.position.x']),
        y: parseFloat(frame1['hands.leftHand.position.y']),
        z: parseFloat(frame1['hands.leftHand.position.z']),
      };

      var frame2LeftHand = {
        x: parseFloat(frame2['hands.leftHand.position.x']),
        y: parseFloat(frame2['hands.leftHand.position.y']),
        z: parseFloat(frame2['hands.leftHand.position.z']),
      };

      var distLeftHand = _this
        .threeDimensionalDistance(frame1LeftHand, frame2LeftHand);

      var frame2RightHand = {
        x: parseFloat(frame2['hands.rightHand.position.x']),
        y: parseFloat(frame2['hands.rightHand.position.y']),
        z: parseFloat(frame2['hands.rightHand.position.z']),
      };

      var frame1RightHand = {
        x: parseFloat(frame1['hands.rightHand.position.x']),
        y: parseFloat(frame1['hands.rightHand.position.y']),
        z: parseFloat(frame1['hands.rightHand.position.z']),
      };

      var distRightHand = _this
        .threeDimensionalDistance(frame1RightHand, frame2RightHand);

      var frame2Head = {
        x: parseFloat(frame2['head.position.x']),
        y: parseFloat(frame2['head.position.y']),
        z: parseFloat(frame2['head.position.z']),
      };
      var frame1Head = {
        x: parseFloat(frame1['head.position.x']),
        y: parseFloat(frame1['head.position.y']),
        z: parseFloat(frame1['head.position.z']),
      };


      var distHead = _this
        .threeDimensionalDistance(frame1Head, frame2Head);


      // Right now, what we do for synchrony, is use the sum of the distance moved as means of
      // determining the R correlation
      return distHead + distLeftHand + distRightHand;

    }


    function dualFrameMap(person, cb) {
      var newArr = [];

      if (person === undefined || person.length === 0 || person.length === 1) return newArr;

      for (var i = 0; i < person.length - 1; i++) {
        var frame1 = person[i];
        var frame2 = person[i + 1];
        newArr.push(cb(frame1, frame2));
      }

      return newArr;
    }

    // DistancePersonA and DistancePersonB just store how much the user has moved in the total time
    var distancePersonA = 0;

    // The personAdistances contains an array that logs how far the user has moved PER frame
    // e.x [3.2, 4.3, 4.5, 3.4, 4.9] where the first element is the distance moved between frame 0 and 1
    // and the next element is the distance moved between 1 and 2

    // The same rules apply for personB

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
      // Now, both personA and personB are an array of numbers
      // We treat personA as the x values for a point, and person B for the y values
      // If they are somewhat equal, on an the graph, we should have a greater R value!
      R: _this.getPearsonCorrelation(personADistances, personBDistances),
      distancePersonA: distancePersonA,
      distancePersonB: distancePersonB
    };

  },

  // Takes two points with x, y, z props and find the distance
  threeDimensionalDistance: function(o1, o2) {
    return Math.sqrt((o2.x - o1.x) * (o2.x - o1.x) + (o2.y - o1.y) * (o2.y - o1.y) + (o2.z - o1.z) * (o2.z - o1.z));
  },

  rProccessor: function(chunkUsers, chunkComparators, chunks) {

    var results = {
      data: []
    };

    for (var i = 0; i < chunks; i++) {

      var rCorrelationData = this.synchronyCalculator(chunkUsers[i], chunkComparators[i]);
      rCorrelationData.chunkNum = i + 1;
      results.data.push(rCorrelationData);


    }

    var x = [];
    var y = [];
    
    results.data.forEach(function(element) {
      x.push(element.distancePersonA);
      y.push(element.distancePersonB);
    });

    results.overallR = this.getPearsonCorrelation(x, y);

    return results;

  },


  adjuster: function(data, callback) {
    var users = Object.keys(data);
    var startUser1 = 0;
    var startUser2 = 0;

    while (data[users[0]][startUser1] && data[users[1]][startUser2]) {


      var user1Frame = data[users[0]][startUser1];
      var user2Frame = data[users[1]][startUser2];
        
      var tLookup = Object.keys(data[users[0]][0])[0];
      
      var timeDiff = user2Frame[tLookup] - user1Frame[tLookup];

      // Resets the starting point if the diff in frames is greater than the threshold, 300ms.
      if (timeDiff > this.SHIFTING_THRESHOLD) {
        startUser1++;
      } else if (timeDiff < -this.SHIFTING_THRESHOLD) {
        startUser2++;
      } else {
        callback(startUser1, startUser2);
        startUser1++;
        startUser2++;
      }

    }
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

  getPearsonCorrelation: function(x, y) {

    var shortestArrayLength = 0;

    if (x.length == y.length) {
      shortestArrayLength = x.length;
    } else if (x.length > y.length) {
      shortestArrayLength = y.length;
      // console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
      shortestArrayLength = x.length;
      // console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
    }

    var xy = [];
    var x2 = [];
    var y2 = [];

    for (var i = 0; i < shortestArrayLength; i++) {
      xy.push(x[i] * y[i]);
      x2.push(x[i] * x[i]);
      y2.push(y[i] * y[i]);
    }

    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_x2 = 0;
    var sum_y2 = 0;

    for (var i = 0; i < shortestArrayLength; i++) {
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

  chunkByTime: function (data, timeChunk) {

    var _this = this;

    // Returns an Array that looks like this:
    // users = ['CornellAvatar1', 'CornellAvatar2'];
    var users = Object.keys(data);
    var startTime = null;

    // This is just the chunk we're on right now.
    // The maximum # of chunks we will have is equal to...
    // totalInteractionTime (watever that is) / timeChunk (after how many secs we should have a chunk)
    var chunkId = 0;

    // Arrays to store chunks for personA, personB (CornellAvatar1, CornellAvatar2)
    var personA = [[]];
    var personB = [[]];

    // Annoying way of looking up timestamps since excel has weird formatting
    // tLookup, if the formatting was right, should just be equal to 'timestamp'
    var tLookup = Object.keys(data[users[0]][0])[0];

    // The adjuster is what 'skips' frames so that R can be as high as possible
    // Think of the adjuster as a for loop that goes over the the frames
    // Instead of giving one index value for an element in the dataset, it gives 2

    // Both indexes don't have to be the same. They just correspond to the elements that have
    // the closest timestamps betweem "CornellAvatar1" and "CornellAvatar2"
    
    this.adjuster(data, function(id1, id2){
      // id1 and id2 are indexes for the frames we should compare

      // Saving the startTime makes it easy for us to chunk after timeChunk (2 secs)
      if (!startTime) startTime = data[users[0]][id1][tLookup];

      // Check if we've hit the 2 sec mark in the interaction, and make a chunk
      if (data[users[0]][id1][tLookup] - startTime > timeChunk) {
        // Point to a new chunkID when adding frames
        chunkId++;
        personA.push([]);
        personB.push([]);
        startTime = data[users[0]][id1]['timestamp']; // reset the start time
      }

      // Add frames to the chunks that chunkID is pointing to
      personA[chunkId].push(data[users[0]][id1]);
      personB[chunkId].push(data[users[1]][id2]);

    });

    return {
      chunkedUser1: personA,
      chunkedUser2: personB,
      numChunks: chunkId + 1
    }

  }

}

