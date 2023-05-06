const fs = require('fs')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))
const userData = require(path.join(__dirname, '../../lib/user-data.js'))

const markChallengeCompleted = helper.markChallengeCompleted

// do I want to do this as a var? un-needed, also can't browser view
// pass in the challenge string?
const currentChallenge = 'repository'

module.exports = async function verifyChallenge(path) {
  console.log("verifyChallenge in main. Path is: ", path)
  // path should be a directory
  if (!fs.lstatSync(path).isDirectory()) {
    helper.logError('Path is not a directory.')
    return
  }

  let result = await checkForGitInit(path).catch((err) => {
    if (err.message.match('Command failed')) {
      return [["This folder isn't being tracked by Git.", false]]
    }
  })
  
  // let result = await checkForGitInit(path).catch((err) => console.log("err! ", err))
  // helper.displayResults(result)
  const success = result && result[0].includes(true)
  if (success) {
    console.log('Challenge count is 1! Marking challenge complete.')
    helper.markChallengeComplete(currentChallenge, result)
  } else {
    helper.challengeIncomplete(result)
  }
  Promise.resolve(result)
}

function checkForGitInit(path) {
  
  return new Promise((resolve, reject) => {
    exec('status', { cwd: path }, function (err, stdout, stdrr) {
      let results
      if (err) {
        // helper.logError('This folder is not being tracked by Git.')
        results = ["This folder isn't being tracked by Git.", false]
        // return resolve([results])
      }
      // can't return on error since git's 'fatal' not a repo is an error
      // potentially read file, look for '.git' directory
      const status = stdout.trim()
      if (status.match('On branch')) {
        results = ['This is a Git repository!', true]
      } else {
        results = ["This folder isn't being tracked by Git.", false]
      }
      resolve([results])
    })
  })
}
