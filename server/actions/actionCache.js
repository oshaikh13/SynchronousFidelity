// a cache for actions from the client

module.exports = {

  cache: {},

  limit: 2000, // change this to change the number of frames stored in a cache for each independent user

  add: function (data) {

    var name = data.displayName;
    
    if (!this.cache[name]) this.cache[name] = [];
    this.cache[name].push(data);
    
    var numRemove = this.cache[name].length - this.limit;

    if (numRemove > 0) this.cache[name] = this.cache[name].splice(numRemove);
    
  },

  // TODO: Binary Search for T1 and T2 and slice may be more efficient...
  // filter uses a linear search
  get: function (username, comparator, t1, t2) {

    var inTimestamps = function (element) {
      return element.timestamp > t1 && element.timestamp < t2;
    }

    if (!this.cache[username]) this.cache[username] = [];
    if (!this.cache[comparator]) this.cache[comparator] = [];

    var inLimitUser = this.cache[username].filter(inTimestamps);
    var inLimitComparator = this.cache[comparator].filter(inTimestamps);
    
    return [inLimitUser, inLimitComparator];

  }

}
