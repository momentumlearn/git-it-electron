// MAIN
// This file is used by every challenge's verify file and is an API for writing
// partial challenge completion messages to the DOM and setting a challenge
// as complete when all parts of a challenge have passed.
//
// It also sets the lanaguage for each challenge's verify's process's Git to
// English.
//
const { BrowserWindow } = require('electron')
const process = require('process')

const window = BrowserWindow.getFocusedWindow()

// Set each challenge verifying process to use
// English language pack
// Potentially move this to user-data.js
process.env.LANG = 'C'

const displayResults = (results) => { 
  console.log("DISPLAY RESULTS -- MAIN 🏵️")
  window.webContents.send('displayResults', results)
}

const markChallengeComplete = (challenge, result) => {
  console.log("MARK CHALLENGE COMPLETE -- MAIN")
  window.webContents.send('challengeComplete', challenge, result)
}

const challengeIncomplete = (results) => {
  window.webContents.send('challengeIncomplete', results)
}

const logError = (errMsg) => {
  window.webContents.send('error', errMsg)
}

module.exports.challengeIncomplete = challengeIncomplete
module.exports.displayResults = displayResults
module.exports.markChallengeComplete = markChallengeComplete
module.exports.logError = logError
