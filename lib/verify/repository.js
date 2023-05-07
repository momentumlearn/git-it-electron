const fs = require('fs')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))

const currentChallenge = 'repository'

module.exports = async function verifyChallenge(path) {
  // path should be a directory
  if (!fs.lstatSync(path).isDirectory()) {
    helper.logError([['Path is not a directory.', false]])
    return
  }

  let result = await checkForGitInit(path).catch((err) => {
    if (err.message.match('Command failed')) {
      return [["This folder isn't being tracked by Git.", false]]
    }
  })

  const success = result && result[0].includes(true)
  if (success) {
    console.log('Challenge count is 1! Marking challenge complete.')
    helper.markChallengeComplete(currentChallenge, result)
  } else {
    helper.challengeIncomplete(result)
  }
  Promise.resolve(result)
}

function checkForGitInit(path) {
  return new Promise((resolve, reject) => {
    exec('status', { cwd: path }, function (err, stdout, stdrr) {
      let result
      if (err) {
        // helper.logError('This folder is not being tracked by Git.')
        result = ["This folder isn't being tracked by Git.", false]
        // return resolve([results])
      }
      // can't return on error since git's 'fatal' not a repo is an error
      // potentially read file, look for '.git' directory
      const status = stdout.trim()
      if (status.match('On branch')) {
        result = ['This is a Git repository!', true]
      } else {
        result = ["This folder isn't being tracked by Git.", false]
      }
      resolve([result])
    })
  })
}
