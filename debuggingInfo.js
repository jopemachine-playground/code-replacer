const StringBuffer = require('./stringBuffer')

module.exports = (function () {
  let instance
  const stringBuf = new StringBuffer()
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
