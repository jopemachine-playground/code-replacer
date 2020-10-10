const StringBuffer = require('./stringBuffer')

module.exports = (function () {
  var instance
  var stringBuf = new StringBuffer()
  function initiate () {
    return stringBuf
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = initiate()
      }
      return instance
    }
  }
})()
