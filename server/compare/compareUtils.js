module.exports = {

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


  threeDimensionalDistance: function (o1, o2) {
    return Math.sqrt((o2.x-o1.x)*(o2.x-o1.x)+(o2.y-o1.y)*(o2.y-o1.y)+(o2.z-o1.z)*(o2.z-o1.z));
  },

  /*
  * Shamefully ripped off R correlator from Steve Gardner 
  * Thank you!
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
