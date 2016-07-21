var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Active!');
});

app.post('/position', function (req, res) {
  res.send('Active!');
});


app.listen(3000, function () {
  console.log('Position Listener on port 3000');
});