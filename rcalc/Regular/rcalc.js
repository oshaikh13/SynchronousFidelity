
var START_EVAL_TIME = Date.now();

// Replace this with the CSV file you want to look at.
// Make sure the file is in the same directory
// The timestamps MUST be sorted (which will be true if it's raw data straight from the server)
var FILENAME = "032.csv";

var csv = require('csv-parser');
var compareUtils = require('./utils.js');
var fs = require('fs');
var jsonfile = require('jsonfile');

var walk    = require('walk');
var files   = [];

// Walker options
var walker  = walk.walk('./data', { followLinks: false });

walker.on('file', function(root, stat, next) {
    // Add this file to the list of files

    if (stat.name.split('.').slice(-1)[0] === 'csv') {
      files.push(root + '/' + stat.name);
    }

    next();
});

var CHUNK_TIME = 4000;

// Just reads the CSV file
var filterCSVFile = function (fileName, callback) {
  var filteredData = {};
  fs.createReadStream(fileName)
    .pipe(csv())
    .on('data', function (data) {
      if (!filteredData[data.displayName])
        filteredData[data.displayName] = [];

      filteredData[data.displayName].push(data);
    })
    .on('end', function (data) {
      callback(filteredData, fileName);
    });
}


walker.on('end', function() {
  files.forEach(function(elem) {
    filterCSVFile(elem, function(data, fname) {

      var tLookup = data.timestamp;

      if (!Object.keys(data).length) {
        return;
      } 

      var chunkedData = compareUtils.chunkByTime(data, 2000);

      var l = compareUtils.rProccessor(chunkedData.chunkedUser1, chunkedData.chunkedUser2, chunkedData.numChunks);

      jsonfile.writeFile((fname.substring(0, fname.length - 3) + "json"), l, {spaces: 2}, function (err) {
        console.log("EVAL TIME: " + (Date.now() - START_EVAL_TIME) + "ms " + fname.substring(0, fname.length - 3) + " " + l.overallR + " " + (currentR/totes));
      });

    })
  })
});

