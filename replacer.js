const chalk = require('chalk')
const matchAll = require('./matchAll')
const yn = require('yn')
const readlineSync = require('readline-sync')
const { handleTemplateLValue, handleTemplateRValue } = require('./template')
const debuggingInfoArr = require('./debuggingInfo')
const optionManager = require('./optionManager')
const {
  CreatingReplacingObjError,
  InvalidLeftTemplateError,
  InvalidRightReferenceError,
  ERROR_CONSTANT
} = require('./error')

const {
  createHighlightedLine,
  logByFlag,
  funcExecByFlag,
  replaceAll,
  printLines
} = require('./util')

const displayConsoleMsg = ({
  lineIdx,
  matchingInfo,
  replaceObj,
  resultLines,
  srcFileLines,
  srcFileName,
  srcLine
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

  funcExecByFlag(
    optionManager.getInstance().confOpt ||
      optionManager.getInstance().verboseOpt,
    () =>
      printLines(
        srcFileName,
        lineIdx,
        sourceStr,
        replacedStr,
        srcFileLines,
        resultLines
      )
  )

  logByFlag(
    optionManager.getInstance().confOpt,
    chalk.dim(
      chalk.italic(
        "## Press enter to replace the string or 'n' to skip this word or 's' to skip this file."
      )
    )
  )
}

const applyCSVTable = ({
  csvTbl,
  templateLValue,
  templateRValue
}) => {
  const replaceObj = {}
  templateRValue = templateRValue.trim().normalize()

  if (csvTbl.length > 0 && templateLValue) {
    const columnNames = Object.keys(csvTbl[0])
    for (const csvRecord of csvTbl) {
      let key = templateLValue
      let value = templateRValue

      for (const columnName of columnNames) {
        const trimmedColumnName = columnName.trim()
        key = replaceAll(
          key,
          `\${${trimmedColumnName}}`,
          csvRecord[columnName]
        )
        value = replaceAll(
          value,
          `\${${trimmedColumnName}}`,
          csvRecord[columnName]
        )
      }

      if (replaceObj[key]) {
        throw new CreatingReplacingObjError(
          ERROR_CONSTANT.DUPLICATE_KEY(key + ', ' + replaceObj[key])
        )
      }
      replaceObj[key] = value
    }
  }

  if (csvTbl.length < 1) {
    // assume to replace using group regular expressions only
    replaceObj[templateLValue] = templateRValue
  }

  return replaceObj
}

const getMatchingPoints = ({ srcLine, replacingKeys }) => {
  const matchingPoints = []
  let matchingPtCnt = 0

  for (const replacingKey of replacingKeys) {
    // reg of replacingKey is already processed
    const regKey = handleTemplateLValue(replacingKey)
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
        const longestStrInMatchingPt = cands[0][0]

        if (
          replacingKeyMatchingStr === longestStrInMatchingPt ||
          !longestStrInMatchingPt.includes(replacingKeyMatchingStr)
        ) {
          continue
        }

        // Should be same matching point.
        if (
          longestStrInMatchingPt.length >
          replacingKeyMatchingPt.index - cands[0].index
        ) {
          existingMatchingPtIdx = matchingPtIdx
          break
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

const getReplacedString = ({ replaceObj, matchingStr }) => {
  let replacedString = replaceObj[matchingStr]
  const noEscapeOpt = optionManager.getInstance()['no-escape']

  if (noEscapeOpt) {
    for (const key of Object.keys(replaceObj)) {
      if (new RegExp(key).test(matchingStr)) {
        replacedString = replaceObj[key]
      }
    }
  }
  return replacedString
}

const replace = ({
  srcFileName,
  srcFileLines,
  csvTbl,
  templateLValue,
  templateRValue,
  excludeRegValue,
  startLinePatt,
  endLinePatt
}) => {
  const resultLines = []
  const replaceObj = applyCSVTable({
    csvTbl,
    templateLValue,
    templateRValue
  })

  if (templateLValue === '') { throw new InvalidLeftTemplateError(ERROR_CONSTANT.LEFT_TEMPLATE_EMPTY) }
  const replacingKeys = Object.keys(replaceObj)

  // sort by length -> prioritize and map keys with long values first.
  replacingKeys.sort(function (a, b) {
    return b.length - a.length || b.localeCompare(a)
  })

  let csvLineIdx = 0
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
          debuggingInfoArr.getInstance().append(
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
          debuggingInfoArr.getInstance().append(`Encountered endLinePatt on line ${lineIdx}`)
        )
        blockingReplaceFlag = true
      }
    )

    if (!blockingReplaceFlag) {
      const { matchingPoints, matchingPtCnt } = getMatchingPoints({
        srcLine,
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

          // TODO: Remove this if statement
          if (templateLValue && templateRValue) {
            // handle grouping value
            const findGroupKeyReg = new RegExp(/\$\[(?<groupKey>[\d\w]*)\]/)
            const groupKeys = matchAll(templateRValue, findGroupKeyReg)
            const value = handleTemplateRValue({ templateRValue, csvTbl, csvLineIdx })

            for (const groupKeyInfo of groupKeys) {
              const groupKey = groupKeyInfo[1]
              for (let regKey of Object.keys(replaceObj)) {
                regKey = handleTemplateLValue(regKey)

                const replacedHandleRValue = value
                const findMatchingStringReg = new RegExp(regKey)
                const groupKeyMatching = srcLine.match(findMatchingStringReg)
                if (!groupKeyMatching) continue
                const groupKeyMatchingStr = groupKeyMatching.groups[groupKey]

                if (!groupKeyMatchingStr) {
                  throw new InvalidRightReferenceError(ERROR_CONSTANT.NON_EXISTENT_GROUPKEY)
                }

                matchingStr = replaceAll(
                  matchingStr,
                  `(?<${groupKey}>)`,
                  groupKeyMatchingStr
                )

                replaceObj[matchingStr] = replaceAll(
                  replaceObj[matchingStr] ? replaceObj[matchingStr] : replacedHandleRValue,
                  `$[${groupKey}]`,
                  groupKeyMatching.groups[groupKey]
                )

                break
              }
            }
            csvLineIdx++
          }

          displayConsoleMsg({
            srcLine,
            matchingInfo,
            replaceObj,
            srcFileName,
            lineIdx,
            srcFileLines,
            resultLines
          })

          let input = 'y'
          optionManager.getInstance().confOpt && (input = readlineSync.prompt())

          if (yn(input) === false) {
            // skip this word. choose other candidate if you have a shorter string to replace.
            logByFlag(
              optionManager.getInstance().confOpt ||
                optionManager.getInstance().verboseOpt,
              chalk.red('\nskip..')
            )
          } else if (input.startsWith('s')) {
            // skip this file.
            console.log(chalk.red(`\nskip '${srcFileName}'..`))
            return -1
          } else {
            // replace string
            const replacedString = getReplacedString({ replaceObj, matchingStr })

            // push the index value of the other matching points.
            for (
              let otherPtsCandidateIdx = matchingPtIdx + 1;
              otherPtsCandidateIdx < matchingPtCnt;
              otherPtsCandidateIdx++
            ) {
              const otherPts = matchingPoints[otherPtsCandidateIdx]

              for (const candItem of otherPts) {
                candItem.index += replacedString.length - matchingStr.length
              }
            }

            logByFlag(
              optionManager.getInstance().confOpt ||
                optionManager.getInstance().verboseOpt,
              chalk.yellow('\nreplace..')
            )

            srcLine =
              srcLine.substr(0, matchingInfo.index) +
              replacedString +
              srcLine.substr(
                matchingInfo.index + matchingStr.length,
                srcLine.length
              )
            break
          }
        }

        if (optionManager.getInstance().onceOpt) break
      }

      lineIdx++
      resultLines.push(srcLine)
    }
  }

  return resultLines
}

module.exports = {
  replace,
  applyCSVTable,
  getMatchingPoints
}
