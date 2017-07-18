// Utilities that requests synchrony requests depend upon.
module.exports = {

  // Tinker with this method to find different means of syncrhony
  sumFrameMap: function(personA, personB) {
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

      return distHead //+ distLeftHand + distRightHand;
      // return distHead;
      // return distLeftHand;
      // return distRightHand;

    }


    function dualFrameMap(person, cb) {
      var newArr = [];

      if (person === undefined || person.length === 0 || person.length === 1) return newArr;

      for (var i = 0; i < person.length - 1; i++) {
        // console.log(i, i + 1);
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

      var chunk = this.sumFrameMap(chunkUsers[i], chunkComparators[i]);
      chunk.chunkNum = i + 1;
      results.data.push(chunk);

    }

    var x = [];
    var y = [];
    
    results.data.forEach(function(element) {
      x.push(element.distancePersonA);
      y.push(element.distancePersonB);
    });


    // Now, both personA and personB are an array of numbers
    // We treat personA as the x values for a point, and person B for the y values
    // If they are somewhat equal, on an the graph, we should have a greater R value!
    results.overallR = this.getPearsonCorrelation(x, y);

    return results;

  },


  forEachFrame: function(data, timeChunk, callback) {
    var users = Object.keys(data);
    var startUser1 = 0;
    var startUser2 = 0;

    var tLookup = Object.keys(data[users[0]][0])[0];


    if (!data[users[0]] || !data[users[1]]) {
      console.log(users);
      return;
    }

    var timeChunk = 2000;
    var currentTime = timeChunk;

    var startTime = data[users[0]][startUser1][tLookup] < data[users[1]][startUser1][tLookup] ? 
                      data[users[0]][startUser1][tLookup] : data[users[1]][startUser2][tLookup];
    var chunkID = 0;


    var pushUpIndex = function (userIdx, currentIdx) {
      var oldIdx = currentIdx;
      while (data[userIdx][currentIdx] && data[userIdx][currentIdx][tLookup] - startTime < timeChunk) {
        currentIdx++;
      }
      return currentIdx;
    }


    while (data[users[0]][startUser1] && data[users[1]][startUser2]) {

      if (data[users[0]][startUser1][tLookup] - startTime >= currentTime || data[users[1]][startUser2][tLookup] - startTime >= currentTime) {
 
        // console.log(chunkID + " " 
        // + (parseInt(data[users[1]][startUser1][tLookup]) - parseInt(data[users[0]][startUser1][tLookup])) + " " 
        // + (data[users[0]][startUser1][tLookup] - startTime) + " "
        // + (data[users[1]][startUser1][tLookup] - startTime) + " " + startUser1 + " " + startUser2 + " " + currentTime);
      }


      if (data[users[0]][startUser1][tLookup] - startTime >= currentTime) {
        startUser2 = pushUpIndex(users[1], startUser2);
        currentTime += timeChunk;
        chunkID++;
      } else if (data[users[1]][startUser2][tLookup] - startTime >= currentTime) {
        startUser1 = pushUpIndex(users[0], startUser1);
        currentTime += timeChunk;
        chunkID++;
      }

      // console.log(startUser1, startUser2, chunkID);
      if (!(data[users[0]][startUser1] && data[users[1]][startUser2])) continue;

      callback(startUser1, startUser2, chunkID);
      startUser1++;
      startUser2++;

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

    // Arrays to store chunks for personA, personB (CornellAvatar1, CornellAvatar2)
    var personA = [[]];
    var personB = [[]];

    // Annoying way of looking up timestamps since excel has weird formatting
    // tLookup, if the formatting was right, should just be equal to 'timestamp'
    var tLookup = Object.keys(data[users[0]][0])[0];

    // The forEachFrame is what 'skips' frames so that R can be as high as possible
    // Think of the forEachFrame as a for loop that goes over the the frames
    // Instead of giving one index value for an element in the dataset, it gives 2

    // Both indexes don't have to be the same. They just correspond to the elements that have
    // the closest timestamps betweem "CornellAvatar1" and "CornellAvatar2"
    var completedChunks = 1;

    this.forEachFrame(data, timeChunk, function(id1, id2, chunkId){



        // startTime = data[users[0]][id1][tLookup]; // reset the start time

      if (!personA[chunkId] || !personB[chunkId]){
        personA.push([]);
        personB.push([]);
      }
      // Add frames to the chunks that chunkID is pointing to
      personA[chunkId].push(data[users[0]][id1]);
      personB[chunkId].push(data[users[1]][id2]);

      completedChunks = chunkId;

    });

    return {
      chunkedUser1: personA,
      chunkedUser2: personB,
      numChunks: completedChunks + 1
    }

  }

}

