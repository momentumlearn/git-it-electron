// verify the git_going challenge
// the challenge should run exec to check that the repo is cloned
// check that the repo exists on GitHub -- have to generate the url using the username from git config
// check that a commit exists making a change
// check that the commit has been pushed to GitHub

const { check } = require('@primer/octicons')
const { debug } = require('console')
const fs = require('fs')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))

const currentChallenge = 'git_going'
const CHALLENGE_COUNT = 3

module.exports = async function verifyChallenge(path) {
  if (!fs.lstatSync(path).isDirectory()) {
    return helper.logError('Path is not a directory.')
  }

  let results
  results = await Promise.all([
    checkRemoteConfigured(path),
    checkCommitExistsLocally(path),
    checkCommitExistsOnRemote(path),
  ])
  const successes = results.filter((result) => result.includes(true))

  if (successes.length === CHALLENGE_COUNT) {
    helper.markChallengeComplete(currentChallenge, results)
  } else {
    helper.challengeIncomplete(results)
  }
  return results
}

function checkCommitExistsLocally(path) {
  return new Promise((resolve, reject) => {
    exec('rev-list HEAD --count', { cwd: path }, (err, stdout, stdrr) => {
      let result
      if (err) {
        result = ["Something isn't quite right", false]
      }
      const revCount = stdout.trim()
      if (revCount > 1) {
        // 1 because the initial commit from GitHub Classroom is always there
        result = ['You have made a commit!', true]
      } else {
        result = ["Can't find a commit.", false]
      }
      resolve(result)
    })
  })
}

function checkRemoteConfigured(path) {
  return new Promise((resolve, reject) => {
    let result
    exec('remote -v', { cwd: path }, (err, stdout, stdrr) => {
      if (err) {
        result = [["Something isn't quite right", false]]
      }
      const remote = stdout.trim()
      const remoteMatch = remote.match(
        /origin\s\https:\/\/github.com.*\/git-going-*/
      )
      if (!remoteMatch) {
        result = ['Did you clone the repo correctly?', false]
      } else {
        result = ['You have successfully cloned the repo.', true]
      }
      resolve(result)
    })
  })
}

function checkCommitExistsOnRemote(path) {
  return new Promise((resolve, reject) => {
    let result
    exec(
      'rev-list origin/main --count',
      { cwd: path },
      (err, stdout, stdrr) => {
        if (err) {
          result = [["Something isn't quite right", false]]
        }
        const revCount = stdout.trim()
        if (revCount > 1) {
          // 1 because the initial commit from GitHub Classroom is always there
          result = ['You have pushed your commit!', true]
        } else {
          result = ["Can't find your commit on the remote.", false]
        }
        resolve(result)
      }
    )
  })
}
