#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))
const userData = require(path.join(__dirname, '../../lib/user-data.js'))

const addToList = helper.addToList
const markChallengeCompleted = helper.markChallengeCompleted

const currentChallenge = 'merge_tada'
let counter = 0
const total = 2

// check that they performed a merge
// check there is not username named branch

module.exports = function verifyMergeTadaChallenge (path) {
  counter = 0
  if (!fs.lstatSync(path).isDirectory()) {
    addToList('Path is not a directory.', false)
    return helper.challengeIncomplete()
  }

  exec('reflog -10', { cwd: path }, function (err, stdout, stdrr) {
    if (err) {
      addToList('Error: ' + err.message, false)
      return helper.challengeIncomplete()
    }
    const ref = stdout.trim()

    if (ref.match('merge')) {
      counter++
      addToList('Branch has been merged!', true)
    } else addToList('No merge in the history.', false)

    exec('config user.username', function (err, stdout, stdrr) {
      if (err) {
        addToList('Could not find username.', false)
        return helper.challengeIncomplete()
      }
      const user = stdout.trim()

      exec('branch', { cwd: path }, function (err, stdout, stdrr) {
        if (err) {
          addToList('Error: ' + err.message, false)
          return helper.challengeIncomplete()
        }

        const branches = stdout.trim()
        const branchName = 'add-' + user

        if (branches.match(branchName)) {
          addToList('Uh oh, branch is still there.', false)
        } else {
          counter++
          addToList('Branch deleted!', true)
          if (counter === total) {
            markChallengeCompleted(currentChallenge)
            userData.updateData(currentChallenge)
          } else helper.challengeIncomplete()
        }
      })
    })
  })
}
