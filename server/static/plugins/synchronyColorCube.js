
var frame = 0;

var DISTANCE_IN_FRONT_OF_ME = 1.5;
var DISTANCE_ABOVE_ME = 1;


var cubePosition = Vec3.sum(MyAvatar.position,Vec3.sum(
                    Vec3.multiply(Quat.getFront(MyAvatar.orientation), DISTANCE_ABOVE_ME), 
                    Vec3.multiply(Quat.getFront(MyAvatar.orientation), DISTANCE_IN_FRONT_OF_ME)));

var cubeObj;

function hslToRgb(hslObj) {
  var h = hslObj.hue;
  var s = hslObj.saturation;
  var l = hslObj.lightness;

  var m1, m2, hue;
  var r, g, b
  s /=100;
  l /= 100;
  if (s == 0)
    r = g = b = (l * 255);
  else {
    if (l <= 0.5)
      m2 = l * (s + 1);
    else
      m2 = l + s - l * s;
    m1 = l * 2 - m2;
    hue = h / 360;
    r = HueToRgb(m1, m2, hue + 1/3);
    g = HueToRgb(m1, m2, hue);
    b = HueToRgb(m1, m2, hue - 1/3);
  }

  return {red: Math.floor(r), green: Math.floor(g), blue: Math.floor(b)};
}

function HueToRgb(m1, m2, hue) {
  var v;
  if (hue < 0)
    hue += 1;
  else if (hue > 1)
    hue -= 1;

  if (6 * hue < 1)
    v = m1 + (m2 - m1) * hue * 6;
  else if (2 * hue < 1)
    v = m2;
  else if (3 * hue < 2)
    v = m1 + (m2 - m1) * (2/3 - hue) * 6;
  else
    v = m1;

  return 255 * v;
}

function lightnessConverter(OldMin, OldMax, NewMin, NewMax, OldValue) {
  var OldRange = (OldMax - OldMin)  
  var NewRange = (NewMax - NewMin)  
  return (((OldValue - OldMin) * NewRange) / OldRange) + NewMin;
}

function paramString(paramObj) {
  var paramStr = "";
  for (var key in paramObj) {
    paramStr += key + "=" + paramObj[key] + "&";
  }
  return str.slice(0, -1);
}

function sendToServer (cb) {


  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
  // you need to make a new instance for every HTTP request

  xmlhttp.onreadystatechange = function () {
    cb(JSON.parse(xmlhttp));
  };

  var params = {
    comparator: comparator,
    username: username,
    chunks: 1,
    cache: true
  }

  xmlhttp.open("GET", baseURL + "api/compare/rawdata?" + paramString(params));
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send();

}

function generateCube() {
  var properties = {
    type: 'Cube',
    id: 'synchronyCube',
    position: cubePosition,
    color: { red: 255, green: 255, blue: 255} 
  };
  cubeObj = Entities.addEntity(properties);
}

// Generate the entities
generateCube();

function updateCube(rValue) {  

  var HSL;

  if (r < 0) {
    HSL = {
      hue: 239,
      saturation: 100,
      lightness: r * -100
    }

  } else if (r > 0) {
    HSL = {
      hue: 360,
      saturation: 100,
      lightness: r * -100
    }
  } else {
    HSL = {
      hue: 360,
      saturation: 100,
      lightness: 100
    }
  }

  Entities.editEntity(cubeObj, {  color: hslToRgb(HSL) });

}

var updateFuncs = [updateCube];

// Main update function
function updateObjects () {
  if (frame % 3 == 0) {
    sendToServer(function(response) {
      updateFuncs.forEach(function(elem){ elem(response.data[0].R); });
    })
  }
  frame++;
}


// register the call back so it fires before each data send
Script.update.connect(updateCube);

Script.scriptEnding.connect(function() {
  Entities.deleteEntity(cubeObj);
});



