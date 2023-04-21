#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))
const userData = require(path.join(__dirname, '../../lib/user-data.js'))

const addToList = helper.addToList
const markChallengeCompleted = helper.markChallengeCompleted

const currentChallenge = 'branches_arent_just_for_birds'
const total = 3
let counter = 0
let username = ''

// get their username
// verify branch matches username, case too.
// verify they've pushed
// check the file is in contributors directory

module.exports = function verifyBranchesChallenge (repopath) {
  counter = 0
  repopath = repopath
  if (!fs.lstatSync(repopath).isDirectory()) return addToList('Path is not a directory.', false)
  exec('config user.username', { cwd: repopath }, function (err, stdout, stderr) {
    if (err) {
      helper.challengeIncomplete()
      return addToList('Error: ' + err.message, false)
    }
    username = stdout.trim()

    exec('rev-parse --abbrev-ref HEAD', { cwd: repopath }, function (err, stdout, stderr) {
      if (err) {
        addToList('Error: ' + err.message, false)
        return helper.challengeIncomplete()
      }
      const actualBranch = stdout.trim()
      const expectedBranch = 'add-' + username
      if (actualBranch.match(expectedBranch)) {
        counter++
        addToList('Found branch as expected!', true)
        checkPush(actualBranch)
      } else {
        addToList('Branch name expected: ' + expectedBranch, false)
        helper.challengeIncomplete()
        checkPush(actualBranch)
      }
    })
  })

  function checkPush (branchname) {
    // look into this, is using reflog the best way? what about origin?
    // sometimes it seems this doesn't work
    exec('reflog show origin/' + branchname, { cwd: repopath }, function (err, stdout, stderr) {
      if (err) {
        addToList('Error: ' + err.message, false)
        return helper.challengeIncomplete()
      }
      if (stdout.match('update by push')) {
        counter++
        addToList('Changes have been pushed!', true)
      } else {
        addToList('Changes not pushed.', false)
        helper.challengeIncomplete()
      }
      findFile()
    })
  }

  function findFile () {
    // see if user is already within /contributors
    if (repopath.match('contributors')) {
      check(repopath)
    } else {
      check(path.join(repopath, '/contributors/'))
    }

    function check (userspath) {
      fs.readdir(userspath, function (err, files) {
        if (err) {
          // TODO ENOENT: no such file or directory, scandir '/Users/jlord/jCode/.../contributors/'
          addToList('Error: ' + err.message, false)
          return helper.challengeIncomplete()
        }
        const allFiles = files.join()
        if (allFiles.match(username)) {
          counter++
          addToList('File in contributors folder!', true)
          if (counter === total) {
            markChallengeCompleted(currentChallenge)
            userData.updateData(currentChallenge)
          }
        } else {
          addToList('File not in contributors folder.', false)
          helper.challengeIncomplete()
        }
      })
    }
  }
}
