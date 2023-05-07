const fs = require('fs')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))
const userData = require(path.join(__dirname, '../../lib/user-data.js'))

const currentChallenge = 'commit_to_it'

module.exports = async function verifyChallenge(path) {
  if (!fs.lstatSync(path).isDirectory()) {
    helper.logError('Path is not a directory.')
    return 
  }

  const result = await checkCommitExists(path).catch(err => console.log(err))
  // helper.displayResults(result)
  const success = result && result[0].includes(true)
  if (success) {
    console.log('Challenge count is 1! Marking challenge complete.')
    helper.markChallengeComplete(currentChallenge, result)
  } else {
    helper.challengeIncomplete()
  }
  Promise.resolve(result)
}

function checkCommitExists(path) {
  return new Promise((resolve, reject) => {
    exec('status', { cwd: path }, (err, stdout, stdrr) => {
      if (err) {
        helper.logError(err)
        return helper.challengeIncomplete()
      }
      const status = stdout.trim()
      console.log({status})
      if (status.match('nothing to commit')) {
        results = ['Changes have been committed!', true]
      } else if (status.match('Changes to be committed')) {
        results = ['Changes have been staged, but not committed.', false]
      } else if (status.match('initial commit')) {
        results = ["Can't find committed changes.", false]
      } else {
        results = ['Seems there are still changes to commit.', false]
      }
      resolve([results])
    })
  })
}
