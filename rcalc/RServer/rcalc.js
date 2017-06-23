
// Replace this with the CSV file you want to look at.
// Make sure the file is in the same directory
// The timestamps MUST be sorted (which will be true if it's raw data straight from the server)
// var FILENAME = "data/032.csv";

var csv = require('csv-parser');
var compareUtils = require('./utils.js');
var fs = require('fs');
var jsonfile = require('jsonfile')


var CHUNK_TIME = 2000;

// Just reads the CSV file
var readCSVFile = function (fileName, callback) {
  var allData = [];
  fs.createReadStream(fileName)
    .pipe(csv())
    .on('data', function (data) {
      allData.push(data);
    })
    .on('end', function (data) {
      callback(allData);
    });
}

var walk    = require('walk');
var files   = [];

// Walker options
var walker  = walk.walk('./data', { followLinks: false });

walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    files.push(root + '/' + stat.name);
    next();
});


var processData = function (data, fname) {
  var START_EVAL_TIME = Date.now();

  var tLookup = data.timestamp;
  if (data[0]) {
    tLookup = (Object.keys(data[0])[0]);
  } else {
    console.log(fname);
    return;
  } 
  // console.log(Object.keys(data[0]));

  var reqTime = 600;
  var lookAhead = 3000;

  var nextIdx = function (data, idx, ahead) {
    var startT = data[idx][tLookup];
    var currentIdx = idx;
    var diff = data[currentIdx][tLookup] - data[idx][tLookup];
    while (data[currentIdx] && diff < ahead) {
      diff = data[currentIdx][tLookup] - data[idx][tLookup];
      currentIdx++;
    }

    if (!data[currentIdx]) return undefined;

    return currentIdx;
  }

  var seperateData = function (data) {
    var resolved = [[], []];
    var first = data[0].displayName;
    data.forEach(function(element) {
      if (element.displayName === first) resolved[0].push(element);
      else resolved[1].push(element);
    });
    return resolved;
  }

  var allRs = [];
  var iter = 0;
  for (var i = 0; i < data.length; i = nextIdx(data, i, reqTime)) {
    // reqTime += reqTime;
    var pointAhead = nextIdx(data, i, lookAhead);
    if (!pointAhead) break;
    var subset = data.slice(i, pointAhead + 1);
    var l = compareUtils.rProccessor(seperateData(subset), 1).data[0];
    l.completionTime = START_EVAL_TIME + reqTime  * iter;
    iter++;
    allRs.push(l);
  }

  var avg = 0;
  allRs.forEach(function(elem) {
    avg += elem.R;
    // console.log(elem.R);
  })
  avg /= allRs.length;
  var allData = {};
  allData.data = allRs;
  allData.avgR = avg;
  // console.log();
  console.log(fname + ": " + avg);
  jsonfile.writeFile((fname.substring(0, fname.length - 3) + "json"), allData, {spaces: 2}, function (err) {
    console.log("DONE WRITING");
  });

  // Just pretty print it to the console
  // console.log("EVAL TIME: " + (Date.now() - START_EVAL_TIME) + "ms");
}

walker.on('end', function() {

  files.forEach(function(fname) {
    readCSVFile(fname, function(data) {
      processData(data, fname);
    })
  })

});




