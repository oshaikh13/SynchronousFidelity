module.exports = {

  cache: {},

  limit: 2000, // Store 3000 frames in memory

  add: function (data) {

    var name = data.displayName;

    if (!cache[name]) cache[name] = [];

    cache[name].push(data);

    var numRemove = cache[name].length - limit;

    if (numRemove > 0) x = x.splice(numRemove);
    
  },

  // TODO: Binary Search for T1 and T2 and slice...
  get: function (username, comparator, t1, t2) {

    var inTimestamps = function (element) {
      return element.timestamp > t1 && element.timestamp < t2;
    }

    if (!this.cache[username]) this.cache[username] = [];
    
    if (!this.cache[comparator]) this.cache[comparator] = [];

    var inLimitUser = this.cache[username].filter(inTimestamps);
    var inLimitComparator = this.cache[comparator].filter(inTimestamps);
    // console.log(inLimitUser, inLimitComparator);
    return [inLimitUser, inLimitComparator];

  }

}