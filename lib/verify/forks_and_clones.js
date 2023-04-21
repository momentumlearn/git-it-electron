#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))
const userData = require(path.join(__dirname, '../../lib/user-data.js'))

const addToList = helper.addToList

const currentChallenge = 'forks_and_clones'
let username = ''

// check that they've added the remote, that shows
// that they've also then forked and cloned.

module.exports = function verifyForksAndClonesChallenge (path) {
  if (!fs.lstatSync(path).isDirectory()) {
    addToList('Path is not a directory.', false)
    return helper.challengeIncomplete()
  }

  exec('config user.username', function (err, stdout, stderr) {
    if (err) {
      addToList('Error: ' + err.message, false)
      return helper.challengeIncomplete()
    }
    username = stdout.trim()

    exec('remote -v', { cwd: path }, function (err, stdout, stdrr) {
      if (err) {
        addToList('Error: ' + err.message, false)
        return helper.challengeIncomplete()
      }
      const remotes = stdout.trim().split('\n')
      if (remotes.length !== 4) {
        addToList('Did not find 2 remotes set up.', false)
        helper.challengeIncomplete()
        userData.updateData(currentChallenge)
        return
      }
      // TODO this is getting wild
      remotes.splice(1, 2)
      let incomplete = 0

      remotes.forEach(function (remote) {
        if (remote.match('origin')) {
          if (remote.match('github.com[\:\/]' + username + '/')) {
            addToList('Origin points to your fork!', true)
          } else {
            incomplete++
            addToList('Origin remote not pointing to ' + username + '/patchwork.', false)
          }
        }
        if (remote.match('upstream')) {
          if (remote.match('github.com[\:\/]jlord/')) {
            addToList('Upstream remote set up!', true)
          } else {
            incomplete++
            addToList('Upstream remote not pointing to jlord/patchwork.', false)
          }
        }
      })
      if (incomplete === 0) {
        userData.updateData(currentChallenge)
        helper.markChallengeCompleted(currentChallenge)
      } else helper.challengeIncomplete()
    })
  })
}
