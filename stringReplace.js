function ensureFlag(flags, flag) {
  return flags.includes(flag) ? flags : flags + flag;
}

function* matchAll(str, regex) {
  const localCopy = new RegExp(regex, ensureFlag(regex.flags, "g"));
  let match = localCopy.exec(str);
  while (match) {
    yield match;
    match = localCopy.exec(str);
  }
}

module.exports = matchAll;