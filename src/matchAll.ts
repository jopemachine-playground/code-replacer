function ensureFlag (flags, flag) {
  return flags.includes(flag) ? flags : flags + flag
}

function * matchAll (str: string, regex: RegExp) {
  const localCopy: RegExp = new RegExp(regex, ensureFlag(regex.flags, 'g'))
  let match: RegExpExecArray | null = localCopy.exec(str)
  while (match) {
    yield match
    match = localCopy.exec(str)
  }
}

export default matchAll
