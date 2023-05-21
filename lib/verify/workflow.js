const fs = require('fs')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))

const currentChallenge = 'workflow'
const CHALLENGE_COUNT = 2

module.exports = async function verifyChallenge(path) {
  if (!fs.lstatSync(path).isDirectory()) {
    return helper.logError('Path is not a directory.')
  }

  let results
  results = await Promise.all([
    checkCommitCount(path),
    checkChangesCommitted(path),
  ])
  const successes = results.filter((result) => result.includes(true))

  if (successes.length === CHALLENGE_COUNT) {
    helper.markChallengeComplete(currentChallenge, results)
  } else {
    helper.challengeIncomplete(results)
  }
  return results
}

function checkCommitCount(path) {
  return new Promise((resolve, reject) => {
    let result
    exec('rev-list HEAD --count', { cwd: path }, (err, stdout, stdrr) => {
      if (err) {
        result = [["Something isn't quite right", false]]
      }
      const count = parseInt(stdout.trim())
      result =
        count > 0
          ? [`You have made ${count} commits!`, true]
          : ['No commits found.', false]
      resolve(result)
    })
  })
}

function checkChangesCommitted(path) {
  return new Promise((resolve, reject) => {
    exec('status', { cwd: path }, (err, stdout, stdrr) => {
      let result
      if (err) {
        result = ["Something isn't quite right", false]
      }
      const status = stdout.trim()

      if (status.match('nothing to commit')) {
        result = ['Changes have been committed!', true]
      } else if (status.match('Changes to be committed')) {
        result = ['Changes have been staged, but not committed.', false]
      } else if (status.match('initial commit')) {
        result = ["Can't find committed changes.", false]
      } else {
        result = ['Seems there are still changes to commit.', false]
      }
      resolve(result)
    })
  })
}
