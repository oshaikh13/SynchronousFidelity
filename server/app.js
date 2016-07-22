var express = require('express');
var app = express();

// Radians.
function getAngles(x, y, z) {
  var obj = {}
  obj.roll  = Mathf.Atan2(2*y*w - 2*x*z, 1 - 2*y*y - 2*z*z);
  obj.pitch = Mathf.Atan2(2*x*w - 2*y*z, 1 - 2*x*x - 2*z*z);
  obj.yaw   =  Mathf.Asin(2*x*y + 2*z*w);
  return obj;
}

app.get('/', function (req, res) {
  res.send('Active!');
});

app.post('/position', function (req, res) {

});


app.listen(3000, function () {
  console.log('Position Listener on port 3000');
});