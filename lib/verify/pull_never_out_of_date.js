#!/usr/bin/env node

const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))
const userData = require(path.join(__dirname, '../../lib/user-data.js'))

const addToList = helper.addToList
const markChallengeCompleted = helper.markChallengeCompleted

const currentChallenge = 'pull_never_out_of_date'

// do a fetch dry run to see if there is anything
// to pull; if there is they haven't pulled yet

module.exports = function verifyPullChallenge (path) {
  exec('fetch --dry-run', { cwd: path }, function (err, stdout, stdrr) {
    if (err) {
      addToList('Error: ' + err.message, false)
      return helper.challengeIncomplete()
    }
    const status = stdout.trim()
    if (!err && status === '') {
      addToList('Up to date!', true)
      markChallengeCompleted(currentChallenge)
      userData.updateData(currentChallenge)
    } else {
      addToList('There are changes to pull in.', false)
      helper.challengeIncomplete()
    }
  })
}
