const fs = require('fs')
const path = require('path')
const exec = require(path.join(__dirname, '../../lib/spawn-git.js'))
const helper = require(path.join(__dirname, '../../lib/helpers.js'))

const currentChallenge = 'remote_control'

module.exports = async function verifyChallenge(path) {
  if (!fs.lstatSync(path).isDirectory()) {
    helper.logError([['Path is not a directory.', false]])
    return
  }
  const result = await checkPush(path).catch((err) => {
    console.log('Error: ', err)
  })
  const success = result && result[0].includes(true)
  if (success) {
    helper.markChallengeComplete(currentChallenge, result)
  } else {
    helper.challengeIncomplete(result)
  }
}

async function checkPush(path) {
  let result
  return new Promise((resolve, reject) => {
    exec('reflog show origin/main', { cwd: path }, (err, stdout, stderr) => {
      if (err) {
        result = ["Something isn't quite right", false]
      }

      const ref = stdout.trim()

      result = ref.match('update by push')
        ? ['You pushed changes to your remote repo!', true]
        : ['No evidence of push to remote repo.', false]
      resolve([result])
    })
  })
}
