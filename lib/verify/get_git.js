console.log("GET GIT JS LOADS 👹")
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))

const markChallengeCompleted = helper.markChallengeCompleted

const addResultToDOM = helper.addResultToDOM
const addResultsToDOM = helper.addResultsToDOM

const currentChallenge = 'get_git'

const CHALLENGE_COUNT = 5

module.exports = async function verifyChallenge() {
  Promise.all([
    checkEmailConfig(),
    checkUsernameConfig(),
    checkGitVersion(),
    checkDefaultBranch(),
    checkRebaseIsFalse()
  ])
    .then((results) => {
      addResultsToDOM(results)
      const successes = results.filter(result => result.includes(true))
      if (successes.length === CHALLENGE_COUNT) {
        markChallengeCompleted(currentChallenge)
        
        userData.updateData(currentChallenge)
      } else {
        helper.challengeIncomplete()
      }
    })
    .catch((err) => console.log(err))
}

function checkEmailConfig() {
  return new Promise((resolve, reject, err) => {
      if (err) {
        addResultToDOM('Error: ' + err.message, false)
        return helper.challengeIncomplete()
      }
    exec('config --global user.email', (err, stdout, stderr) => {
      if (err) {
        addResultToDOM('Error: ' + err.message, false)
        return helper.challengeIncomplete()
      }
      const email = stdout.trim()
      const results = email
        ? ['Email is configured!', true]
        : ['No email found.', false]
      resolve(results)
    })
  })
}

function checkUsernameConfig() {
  return new Promise((resolve, reject, err) => {
    exec('config --global user.name', function (err, stdout, stderr) {
      if (err) {
        addResultToDOM('Error: ' + err.message, false)
        return helper.challengeIncomplete()
      }
      const username = stdout.trim()
      const results = username
        ? ['Username is configured!', true]
        : ['No username found.', false]
      resolve(results)
    })
  })
}

function checkGitVersion() {
  return new Promise((resolve, reject) => {
    exec('--version', function (err, stdout, stdrr) {
      if (err) {
        addResultToDOM('Error: ' + err.message, false)
        return helper.challengeIncomplete()
      }
      const gitOutput = stdout.trim()
      const results = gitOutput.match('git version')
        ? ['Git is installed!', true]
        : ['Did not find Git installed.', false]
      resolve(results)
    })
  })
}

function checkDefaultBranch() {
  return new Promise((resolve, reject) => {
    exec('config --global init.defaultBranch', function (err, stdout, stdrr) {
      if (err) {
        addResultToDOM('Error: ' + err.message, false)
        return helper.challengeIncomplete()
      }
      const defaultBranch = stdout.trim()
      const results = defaultBranch.match('main')
        ? ['Default branch is set to main!', true]
        : ['Default branch not set to main.', false]
      resolve(results)
    })
  })
}

function checkRebaseIsFalse() {
  return new Promise((resolve, reject) => {
    exec('config --global pull.rebase', function (err, stdout, stdrr) {
      if (err) {
        addResultToDOM('Error: ' + err.message, false)
        return helper.challengeIncomplete()
      }
      const defaultBranch = stdout.trim()
      const results = defaultBranch.match('false')
        ? ['Default merge strategy is correctly set!', true]
        : ['Default merge strategy is not set.', false]
        resolve(results)
    })
  })
}
