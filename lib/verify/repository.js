const fs = require('fs')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))
const userData = require(path.join(__dirname, '../../lib/user-data.js'))


const markChallengeCompleted = helper.markChallengeCompleted

// do I want to do this as a var? un-needed, also can't browser view
// pass in the challenge string?
const currentChallenge = 'repository'

module.exports = async function verifyChallenge (path) {
  console.log("In repository.js verifyChallenge")
  // path should be a directory
  console.log("path: " + path)
  if (!fs.lstatSync(path).isDirectory()) {
    helper.logError('Path is not a directory.')
    return helper.challengeIncomplete()
  }
  
  return new Promise((resolve, reject, err) => {
    exec('status', { cwd: path }, function (err, stdout, stdrr) {
      if (err) {
        helper.logError('This folder is not being tracked by Git.')
        return helper.challengeIncomplete()
      }
      // can't return on error since git's 'fatal' not a repo is an error
      // potentially read file, look for '.git' directory
      const status = stdout.trim()
      
      if (status.match('On branch')) {
        results = ['This is a Git repository!', true]
        helper.markChallengeComplete(currentChallenge)
      } else {
        results = ["This folder isn't being tracked by Git.", false]
        helper.challengeIncomplete()
      }
      resolve(results)
    })
  })
  
}
