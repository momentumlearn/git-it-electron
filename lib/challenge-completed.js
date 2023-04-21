//
// This file touches the DOM and provides an API for setting the page after
// challenge has been completed by toggling the buttons that are disabled
// or enabled. It as updates user-data.
//
// It is required by each challenge's verify file.
//

const fs = require('fs')
const path = require('path')

const userData = require(path.normalize(path.join(__dirname, 'user-data.js')))
let data
let spinner

// on click, disable the verify button
const verifyButton = document.getElementById('verify-challenge')
const directoryPathContent = document.getElementById('directory-path')
const verifySpinner = document.getElementById('verify-spinner')
const clearStatusButton = document.getElementById('clear-completed-challenge')

verifyButton.addEventListener('click', function () {
  // unless they didn't select a directory
  if (directoryPathContent && directoryPathContent.innerText && !directoryPathContent.innerText.match(/Please select/)) {
    document.getElementById('verify-list').style.display = 'block'
    disableVerifyButtons(true)
    startSpinner()
  }
  // if there is no directory button
  if (!directoryPathContent) {
    document.getElementById('verify-list').style.display = 'block'
    disableVerifyButtons(true)
    startSpinner()
  }
})

const startSpinner = function () {
  spinner = setTimeout(spinnerDelay, 100)
}

const spinnerDelay = function () {
  // If clear button exists then challenge is completed
  if (clearStatusButton.style.display === 'none') {
    verifySpinner.style.display = 'inline-block'
  }
}

const disableVerifyButtons = function (boolean) {
  document.getElementById('verify-challenge').disabled = boolean
  const directoryButton = document.getElementById('select-directory')
  if (directoryButton) { document.getElementById('select-directory').disabled = boolean }
}

const enableClearStatus = function (challenge) {
  // hide spinner
  // TODO cancel the timeout here
  verifySpinner.style.display = 'none'
  disableVerifyButtons(true)
  clearStatusButton.style.display = 'inline-block'
  clearStatusButton.addEventListener('click', function clicked (event) {
    // set challenge to uncompleted and update the user's data file
    data.contents[challenge].completed = false
    fs.writeFileSync(data.path, JSON.stringify(data.contents, null, 2))
    // remove the completed status from the page and renable verify button
    document.getElementById(challenge).classList.remove('completed')
    disableVerifyButtons(false)
    removeClearStatus()

    // if there is a list of passed parts of challenge, remove it
    const verifyList = document.getElementById('verify-list')
    if (verifyList) verifyList.style.display = 'none'
  })
}

const removeClearStatus = function () {
  clearStatusButton.style.display = 'none'
}


const completed = function (challenge) {
  document.addEventListener('DOMContentLoaded', function (event) {
    checkCompletedness(challenge)

    Object.keys(data.contents).forEach(function (key) {
      if (data.contents[key].completed) {
        document.getElementById(key).classList.add('completed')
      }
    })
  })

  function checkCompletedness (challenge) {
    data = userData.getData()
    if (data.contents[challenge].completed) {
      document.getElementById(challenge).classList.add('completed')
      const header = document.getElementsByTagName('header')[0]
      header.className += ' challenge-is-completed'
      // If completed, show clear button and disable verify button
      enableClearStatus(challenge)
      disableVerifyButtons(true)
    } else removeClearStatus()
  }
}

const challengeIncomplete = function () {
  clearTimeout(spinner)
  // re-enable the verify button
  disableVerifyButtons(false)
  verifySpinner.style.display = 'none'
}

module.exports.enableClearStatus = enableClearStatus
module.exports.completed = completed
module.exports.disableVerifyButtons = disableVerifyButtons
module.exports.challengeIncomplete = challengeIncomplete
