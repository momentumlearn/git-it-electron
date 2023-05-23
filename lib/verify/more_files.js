const { check } = require('@primer/octicons')
const fs = require('fs')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))

const currentChallenge = 'more_files'

module.exports = async function verifyChallenge(path) {
  if (!fs.lstatSync(path).isDirectory()) {
    return helper.logError('Path is not a directory.')
  }

  let results
  results = await checkStagedChanges(path)

  if (results.flat().includes(true)) {
    helper.markChallengeComplete(currentChallenge, results)
  } else {
    helper.challengeIncomplete(results)
  }
  return results
}

function checkStagedChanges(path) {
  return new Promise((resolve, reject) => {
    exec('diff --staged', { cwd: path }, (err, stdout, stdrr) => {
      let result
      if (err) {
        result = ["Something isn't quite right", false]
      }
      const diff = stdout.trim()
      console.log({ diff })
      if (diff.match('readme.txt')) {
        result = [
          'Oops! You staged readme.txt, but we want to leave it out of this commit.',
          false,
        ]
      } else if (diff.match('demo.txt')) {
        result = ['You have staged demo.txt!', true]
      } else {
        result = ["Can't find staged changes.", false]
      }
      resolve([result])
    })
  })
}
