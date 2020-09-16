const errHandler = require('./util').err;

module.exports = function argumentHandler(commandArguments) {
  const argument = {};

  const argMap = new Map;

  for (commandArgument of commandArguments) {
    if (commandArgument.startsWith("--")) {
      // To do : Add options
    } else if (commandArgument.startsWith("-")) {
      // To do : Add options
    } else if (commandArgument.includes("=")) {
      const group = commandArgument.split("=");
      const key = group[0];
      const value = group[1];

      argMap.set(key, value);
    } else {
      // To do : Add options
    }
  }

  for ([argKey, value] of argMap) {
    switch (argKey) {
      case "dir":
        argument.dir = value;
        break;
      case "ext":
        argument.ext = value;
        break;
      case "target":
        argument.target = value;
        break;
      case "replaceList":
        argument.replaceListFile = value;
        break;
      default:
        errHandler();
    }
  }

  return argument;
}