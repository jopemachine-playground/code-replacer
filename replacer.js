const chalk = require('chalk')
const matchAll = require('./matchAll')
const yn = require('yn')
const readlineSync = require('readline-sync')
const _ = require('lodash')

const {
  createHighlightedLine,
  handleSpecialCharacter,
  logByFlag,
  funcExecByFlag,
  replaceAll,
  printLines
} = require('./util')

displayConsoleMsg = ({
  srcLine,
  matchingInfo,
  replaceObj,
  confOpt,
  verboseOpt,
  targetFileName,
  lineIdx,
  srcFileLines,
  resultLines
}) => {
  const matchingStr = matchingInfo[0]

  const sourceStr = createHighlightedLine(
    srcLine,
    matchingInfo.index,
    matchingStr,
    matchingInfo.index + matchingStr.length
  )
  const replacedStr = createHighlightedLine(
    srcLine,
    matchingInfo.index,
    replaceObj[matchingStr],
    matchingInfo.index + matchingStr.length
  )

  funcExecByFlag(confOpt || verboseOpt, () =>
    printLines(
      targetFileName,
      lineIdx,
      sourceStr,
      replacedStr,
      srcFileLines,
      resultLines
    )
  )

  logByFlag(
    confOpt,
    chalk.dim(
      chalk.italic(
        "## Press enter to replace the string or 'n' to skip this word or 's' to skip this file."
      )
    )
  )
}

getReplacingKeys = ({
  replaceObj,
  replaceListFile,
  templateLValue,
  templateRValue,
  verboseOpt
}) => {
  let keys = Object.keys(replaceObj)

  // sort by length -> prioritize and map keys with long values first.
  keys.sort(function (a, b) {
    return b.length - a.length || b.localeCompare(a)
  })

  logByFlag(verboseOpt, 'keys:')
  logByFlag(verboseOpt, keys)

  if (templateLValue && templateRValue) {
    templateRValue = templateRValue.trim().normalize()

    keys = _.map(keys, (key) => {
      key = templateLValue.replace('\\$\\{source\\}', key)
      replaceObj[key] = templateRValue.replace('${value}', replaceObj[key])
      return key
    })

    if (!replaceListFile) {
      // assume to replace using group regular expressions only
      keys.push(templateLValue)
    }
  }

  return keys
}

getMatchingPoints = ({ srcLine, templateLValue, replacingKeys }) => {
  const matchingPoints = []
  let matchingPtCnt = 0

  for (const replacingKey of replacingKeys) {
    // reg of replacingKey is already processed
    const regKey = templateLValue
      ? replacingKey
      : handleSpecialCharacter(replacingKey)
    const replacingKeyReg = new RegExp(regKey)
    const replacingKeyMatchingPts = matchAll(srcLine, replacingKeyReg)

    for (const replacingKeyMatchingPt of replacingKeyMatchingPts) {
      let existingMatchingPtIdx = -1

      for (
        let matchingPtIdx = 0;
        matchingPtIdx < matchingPoints.length;
        matchingPtIdx++
      ) {
        const cands = matchingPoints[matchingPtIdx]
        const replacingKeyMatchingStr = replacingKeyMatchingPt[0]

        for (let candIdx = 0; candIdx < cands.length; candIdx++) {
          const candStr = cands[candIdx][0]
          if (
            replacingKeyMatchingStr === candStr ||
            (!replacingKeyMatchingStr.includes(candStr) &&
              !candStr.includes(replacingKeyMatchingStr))
          ) {
            continue
          }

          // Should be same matching point.
          if (
            candStr.length - replacingKeyMatchingStr.length >=
            cands[candIdx].index - replacingKeyMatchingPt.index
          ) {
            existingMatchingPtIdx = matchingPtIdx
            break
          }
        }
      }

      if (existingMatchingPtIdx === -1) {
        matchingPoints[matchingPtCnt++] = [replacingKeyMatchingPt]
      } else {
        matchingPoints[existingMatchingPtIdx].push(replacingKeyMatchingPt)
      }
    }
  }

  for (
    let matchingPtIdx = 0;
    matchingPtIdx < matchingPoints.length;
    matchingPtIdx++
  ) {
    const cands = matchingPoints[matchingPtIdx]
    cands.leastIdx = Number.MAX_SAFE_INTEGER

    for (let candIdx = 0; candIdx < cands.length; candIdx++) {
      if (cands.leastIdx > cands[candIdx].index) {
        cands.leastIdx = cands[candIdx].index
      }
    }
  }

  // Sort matching points to match in asc order
  matchingPoints.sort((lPt, rPt) => {
    return lPt.leastIdx - rPt.leastIdx
  })

  return {
    matchingPoints,
    matchingPtCnt
  }
}

module.exports = ({
  targetFileName,
  srcFileLines,
  replaceObj,
  templateLValue,
  templateRValue,
  excludeRegValue,
  replaceListFile,
  startLinePatt,
  endLinePatt,
  verboseOpt,
  confOpt,
  onceOpt
}) => {
  const resultLines = []
  const replacingKeys = getReplacingKeys({
    replaceObj,
    replaceListFile,
    templateLValue,
    templateRValue,
    verboseOpt
  })

  let lineIdx = 1
  let blockingReplaceFlag = !!startLinePatt

  for (let srcLine of srcFileLines) {
    if (excludeRegValue && srcLine.match(new RegExp(excludeRegValue))) {
      lineIdx++
      resultLines.push(srcLine)
      continue
    }

    // handle blocking replace
    funcExecByFlag(
      blockingReplaceFlag &&
        startLinePatt &&
        srcLine.trim() === startLinePatt.trim(),
      () => {
        funcExecByFlag(debugOpt, () =>
          debuggingInfoArr.append(
            `Encountered startLinePatt on line ${lineIdx}`
          )
        )
        blockingReplaceFlag = false
      }
    )

    funcExecByFlag(
      !blockingReplaceFlag &&
        endLinePatt &&
        srcLine.trim() === endLinePatt.trim(),
      () => {
        funcExecByFlag(debugOpt, () =>
          debuggingInfoArr.append(`Encountered endLinePatt on line ${lineIdx}`)
        )
        blockingReplaceFlag = true
      }
    )

    if (!blockingReplaceFlag) {
      const { matchingPoints, matchingPtCnt } = getMatchingPoints({
        srcLine,
        templateLValue,
        replacingKeys
      })

      for (
        let matchingPtIdx = 0;
        matchingPtIdx < matchingPtCnt;
        matchingPtIdx++
      ) {
        // Match the longest string first
        const matchingCandidates = matchingPoints[matchingPtIdx]

        for (
          let candidateIdx = 0;
          candidateIdx < matchingCandidates.length;
          candidateIdx++
        ) {
          const matchingInfo = matchingCandidates[candidateIdx]
          let matchingStr = matchingInfo[0]

          // Need more test
          if (templateLValue && templateRValue && !replaceListFile) {
            // handle grouping value
            const findGroupKeyReg = new RegExp(/\$\{(?<groupKey>\w*)\}/)
            const groupKeys = matchAll(templateRValue, findGroupKeyReg)

            for (const groupKeyInfo of groupKeys) {
              const groupKey = groupKeyInfo[1]
              const findMatchingStringReg = new RegExp(templateLValue)
              const groupKeyMatching = srcLine.match(findMatchingStringReg)
              const groupKeyMatchingStr = groupKeyMatching.groups[groupKey]

              matchingStr = matchingStr.replace(
                `(?<${groupKey}>)`,
                groupKeyMatchingStr
              )

              replaceObj[matchingStr] = replaceAll(
                templateRValue,
                `\${${groupKey}}`,
                groupKeyMatching.groups[groupKey]
              )
            }
          }

          displayConsoleMsg({
            srcLine,
            matchingInfo,
            replaceObj,
            confOpt,
            verboseOpt,
            targetFileName,
            lineIdx,
            srcFileLines,
            resultLines
          })

          let input = 'y'
          confOpt && (input = readlineSync.prompt())

          if (yn(input) === false) {
            // skip this word. choose other candidate if you have a shorter string to replace.
            logByFlag(confOpt || verboseOpt, chalk.red('\nskip..'))
          } else if (input.startsWith('s')) {
            // skip this file.
            console.log(chalk.red(`\nskip '${targetFileName}'..`))
            return -1
          } else {
            // replace string

            // push the index value of the other matching points.
            for (
              let otherPtsCandidateIdx = matchingPtIdx + 1;
              otherPtsCandidateIdx < matchingPtCnt;
              otherPtsCandidateIdx++
            ) {
              const otherPts = matchingPoints[otherPtsCandidateIdx]

              for (const candItem of otherPts) {
                candItem.index +=
                  replaceObj[matchingStr].length - matchingStr.length
              }
            }

            logByFlag(confOpt || verboseOpt, chalk.yellow('\nreplace..'))

            srcLine =
              srcLine.substr(0, matchingInfo.index) +
              replaceObj[matchingStr] +
              srcLine.substr(
                matchingInfo.index + matchingStr.length,
                srcLine.length
              )
            break
          }
        }

        if (onceOpt) break
      }

      lineIdx++
      resultLines.push(srcLine)
    }
  }

  return resultLines
}
