import StringBuffer from '../stringBuffer';

export default (() => {
  let instance: StringBuffer;
  const stringBuf = new StringBuffer();
  function initiate () {
    return stringBuf;
  }

  return {
    getInstance () {
      if (!instance) {
        instance = initiate();
      }
      return instance;
    }
  };
})();
