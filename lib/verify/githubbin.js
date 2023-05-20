#!/usr/bin/env node

const axios = require('axios')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))

const currentChallenge = 'githubbin'

const CHALLENGE_COUNT = 3

module.exports = async function verifyChallenge() {
  const outcomes = []
  let username
  checkUsernameConfig()
    .then((results) => {
      const { result, user } = results
      username = user
      if (!username) {
        helper.challengeIncomplete([
          ['GitHub account cannot be checked', false],
          result,
        ])
      }
      outcomes.push(result)
      return checkGitHub(username)
    })
    .then((results) => {
      console.log('callback for GitHub check: ', results)
      const {result, githubUsername} = results
      outcomes.push(result)
      return checkUsernameMatch(githubUsername, username)
    })
    .then((result) => {
      console.log('callback for checkUsernameMatch', result)
      outcomes.push(result)
      return outcomes
    })
    .then((outcomes) => {
      console.log('🫗 outcomes', outcomes)
      const failures = outcomes.filter((outcome) => outcome.includes(false))
      const successes = outcomes.filter((outcome) => outcome.includes(true))
      if (successes.length === CHALLENGE_COUNT) {
        helper.markChallengeComplete(currentChallenge, outcomes)
      } else {
        helper.challengeIncomplete(failures)
      }
    })
    .catch((err) => {
      console.log('👾', err)
      helper.challengeIncomplete([err.result])
    })
}

async function checkUsernameConfig() {
  let result
  let user
  return new Promise((resolve, reject) => {
    exec('config --global user.username', function (err, stdout, stderr) {
      if (err) {
        console.log('ERRORRRR 🐻')
        // TODO Catch 'Command failed: /bin/sh -c git config user.username'
        helper.logError(err)
        helper.challengeIncomplete(err)
      }
      user = stdout.trim()
      console.log('user in checkUsernameConfig', user)
      if (user) {
        resolve({ result: ['Username is configured!', true], user })
      } else {
        // reject so that the subsequent checks don't run
        reject({ result: ['Username is not set in git config. GitHub username cannot be checked.', false], user })
      }
    })
  })
}

async function checkGitHub(user) {
  const options = {
    method: 'get',
    url: 'https://api.github.com/users/' + user,
    headers: { accept: 'application/json' },
  }

  return new Promise((resolve, reject) => {
    if (!user) {
      return reject([['No username found in checkGitHub.', false]])
    }
    let result
    let githubUsername
    axios(options)
      .then((response) => {
        const { status, data } = response
        result =
          status === 200
            ? ["You're on GitHub!", true]
            : [
                "GitHub account matching Git config username wasn't found.",
                false,
              ]
        githubUsername = data.login
        resolve({ result, githubUsername })
      })
      .catch((error) => {
        // TODO this should be a catch for a 404 error
        // which will happen if the username is missing or incorrect
        // decide if errors should be treated like failed results or reported to the user as errors
        helper.logError([
          ["GitHub account matching Git config username wasn't found.", false],
        ])
        return helper.challengeIncomplete(error)
      })
  })
}

async function checkUsernameMatch(githubUsername, configUsername) {
  return new Promise((resolve, reject) => {
    if (!githubUsername || !configUsername) {
      reject([['No username found in CheckUsernameMatch.', false]])
    }
    const result = configUsername.match(githubUsername)
      ? ['Username is the same on GitHub and in Git config!', true]
      : ['GitHub & Git config usernames do not match.', false]
    resolve(result)
  })
}
