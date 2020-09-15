module.exports = {
  err: function () {
    console.log("Wrong usage. \nCheck the correct usage.");
    process.exit();
  },

  getProperties: function(object) {
    let result = "";
    for (let key of Object.keys(object)) {
      result += `${key}=${object[key]}
  `
    }
    return result;
  }
};
