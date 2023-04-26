//
// This file is used by every challenge's verify file and is an API for writing
// partial challenge completion messages to the DOM and setting a challenge
// as complete when all parts of a challenge have passed.
//
// It also sets the lanaguage for each challenge's verify's process's Git to
// English.
//

var process = require('process')
var path = require('path')
var completed = require(path.join(__dirname, 'challenge-completed.js'))

// Set each challenge verifying process to use
// English language pack
// Potentially move this to user-data.js
process.env.LANG = 'C'

const ul = document.getElementById('verify-list')

const addResultsToDOM = (messages) => {
  messages.forEach(([message, success]) => addResultToDOM(message, success))
}

const addResultToDOM = function (message, success) {
  const li = document.createElement('li')
  const text = document.createTextNode(message)
  li.appendChild(text)
  li.classList.add(success ? 'verify-pass' : 'verify-fail')
  ul.appendChild(li)
}

const markChallengeCompleted = function (challenge) {
  document.getElementById(challenge).classList.add('completed')
  const completeMsgDiv = document.createElement("div")
  const completeMsg = document.createTextNode("Challenge completed! 🎉")
  completeMsgDiv.appendChild(completeMsg)
  document.getElementById("challenge-result").appendChild(completeMsgDiv)
  completed.enableClearStatus(challenge)
}

const showTryAgainMessage = () => {
  const tryAgainMessageDiv = document.getElementById('verify-try-again')
  tryAgainMessageDiv.innerHTML =
    'Fix the errors by checking the steps above, and then click verify again.'
}

const challengeIncomplete = function () {
  showTryAgainMessage()
  completed.challengeIncomplete()
}

module.exports.markChallengeCompleted = markChallengeCompleted
module.exports.addResultToDOM = addResultToDOM
module.exports.addResultsToDOM = addResultsToDOM
module.exports.challengeIncomplete = challengeIncomplete
