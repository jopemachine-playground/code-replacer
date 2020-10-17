import StringBuffer from './stringBuffer'

export default (function () {
  let instance: StringBuffer
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
