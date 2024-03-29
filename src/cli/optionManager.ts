import { OptionManager } from '../type/optionManager';

export default (() => {
  let instance: OptionManager;
  const options = {};
  function initiate () {
    return options;
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
