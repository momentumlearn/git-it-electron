const fs = require('fs')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))
const userData = require(path.join(__dirname, '../../lib/user-data.js'))

const addToList = helper.addToList
const markChallengeCompleted = helper.markChallengeCompleted

// do I want to do this as a var? un-needed, also can't browser view
// pass in the challenge string?
const currentChallenge = 'repository'

module.exports = function repositoryVerify (path) {
  // path should be a directory
  if (!fs.lstatSync(path).isDirectory()) {
    addToList('Path is not a directory.', false)
    return helper.challengeIncomplete()
  }
  exec('status', { cwd: path }, function (err, stdout, stdrr) {
    if (err) {
      addToList('This folder is not being tracked by Git.', false)
      return helper.challengeIncomplete()
    }
    // can't return on error since git's 'fatal' not a repo is an error
    // potentially read file, look for '.git' directory
    const status = stdout.trim()
    if (status.match('On branch')) {
      addToList('This is a Git repository!', true)
      markChallengeCompleted(currentChallenge)
      userData.updateData(currentChallenge)
    } else {
      addToList("This folder isn't being tracked by Git.", false)
      helper.challengeIncomplete()
    }
  })
}
