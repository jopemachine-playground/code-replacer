module.exports = (function () {
  let instance
  const options = {}
  function initiate () {
    return options
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
