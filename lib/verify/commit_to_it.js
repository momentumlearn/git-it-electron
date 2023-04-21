const fs = require('fs')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))
const userData = require(path.join(__dirname, '../../lib/user-data.js'))

const addToList = helper.addToList
const markChallengeCompleted = helper.markChallengeCompleted

const currentChallenge = 'commit_to_it'

// check that they've commited changes

module.exports = function commitVerify (path) {
  if (!fs.lstatSync(path).isDirectory()) {
    addToList('Path is not a directory.', false)
    return helper.challengeIncomplete()
  }
  exec('status', { cwd: path }, function (err, stdout, stdrr) {
    if (err) {
      addToList('Error: ' + err.message, false)
      return helper.challengeIncomplete()
    }
    const show = stdout.trim()

    if (show.match('Initial commit')) {
      addToList("Can't find committed changes.", false)
    } else if (show.match('nothing to commit')) {
      addToList('Changes have been committed!', true)
      markChallengeCompleted(currentChallenge)
      userData.updateData(currentChallenge)
    } else {
      addToList('Seems there are changes to commit still.', false)
      helper.challengeIncomplete()
    }
  })
}
