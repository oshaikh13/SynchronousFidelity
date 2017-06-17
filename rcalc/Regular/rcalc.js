
var START_EVAL_TIME = Date.now();

// Replace this with the CSV file you want to look at.
// Make sure the file is in the same directory
// The timestamps MUST be sorted (which will be true if it's raw data straight from the server)
var FILENAME = "032.csv";

var csv = require('csv-parser');
var compareUtils = require('./utils.js');
var fs = require('fs');

var CHUNK_TIME = 2000;

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
      callback(filteredData);
    });
}

filterCSVFile(FILENAME, function(data) {

  var chunkedData = compareUtils.chunkByTime(data, 2000);

  var l = compareUtils.rProccessor(chunkedData.chunkedUser1, chunkedData.chunkedUser2, chunkedData.numChunks);

  // Just pretty print it to the console
  console.log(JSON.stringify(l, null, 2));
  console.log("EVAL TIME: " + (Date.now() - START_EVAL_TIME) + "ms");

})


