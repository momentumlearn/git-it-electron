#!/usr/bin/env node

const path = require('path')
const request = require('request')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))
const userData = require(path.join(__dirname, '../../lib/user-data.js'))

const addToList = helper.addToList
const markChallengeCompleted = helper.markChallengeCompleted

const currentChallenge = 'requesting_you_pull_please'
const url = 'http://reporobot.jlord.us/pr?username='

// check that they've submitted a pull request
// to the original repository jlord/patchwork

module.exports = function verifyPRChallenge () {
  exec('config user.username', function (err, stdout, stdrr) {
    if (err) {
      addToList('Error: ' + err.message, false)
      return helper.challengeIncomplete()
    }
    const username = stdout.trim()
    pullrequest(username)
  })

  function pullrequest (username) {
    request(url + username, { json: true }, function (err, response, body) {
      if (!err && response.statusCode === 200) {
        const pr = body.pr
        if (pr) {
          addToList('Found your pull request!', true)
          markChallengeCompleted(currentChallenge)
          userData.updateData(currentChallenge)
        } else {
          // TODO give user url to their repo also
          addToList('No merged pull request found for ' + username +
            '. If you did make a pull request, return to ' +
            'its website to see comments.', false)
          helper.challengeIncomplete()
        }
      }
    })
  }
}
