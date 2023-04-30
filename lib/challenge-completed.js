console.log("challenge-completed.js loaded")
// MAIN
// // This file touches the DOM and provides an API for setting the page after
// // challenge has been completed by toggling the buttons that are disabled
// // or enabled. It as updates user-data.
// //
// // It is required by each challenge's verify file.
// //

// const fs = require('fs')
const path = require('path')
const userDataContents = require(path.join(__dirname, 'user-data.js')).getDataFromFile().contents

// let data
// let spinner

// // on click, disable the verify button
// const verifyButton = document.getElementById('verify-challenge')
// const directoryPathContent = document.getElementById('directory-path')
// const verifySpinner = document.getElementById('verify-spinner')
// const resetButton = document.getElementById('clear-completed-challenge')

// verifyButton.addEventListener('click', function () {
const updatePage = () => {
  // unless they didn't select a directory
  if (directoryPathContent && directoryPathContent.innerText && !directoryPathContent.innerText.match(/Please select/)) {
    document.getElementById('verify-list').style.display = 'block'
    disableVerifyButtons(true)
    startSpinner()
  }
  console.log("📝 updatePage called")
  // if there is no directory button
  if (!directoryPathContent) {
    console.log("no directory button")
    document.getElementById('verify-list').style.display = 'block'
    disableVerifyButtons(true)
    startSpinner()
  }
}


const clearCompletedMessage = function () { 
  document.getElementById("challenge-result").innerHTML = ""
}
  


const enableClearStatus = function (challenge) {
  // hide spinner
  // TODO cancel the timeout here
  verifySpinner.style.display = 'none'
  disableVerifyButtons(true)
  resetButton.style.display = 'inline-block'
  resetButton.addEventListener('click', function clicked (event) {
    // set challenge to uncompleted and update the user's data file
    userDataContents[challenge].completed = false
    // fs.writeFileSync(data.path, JSON.stringify(userDataContents, null, 2))
    // remove the completed status from the page and renable verify button
    document.getElementById(challenge).classList.remove('completed')
    disableVerifyButtons(false)
    removeClearStatus()
    clearCompletedMessage()
    
    // if there is a list of passed parts of challenge, remove it
    const verifyList = document.getElementById('verify-list')
    if (verifyList) verifyList.style.display = 'none'
  })
}

const removeClearStatus = function () {
  resetButton.style.display = 'none'
}


// const completed = function (challenge) {
//   document.addEventListener('DOMContentLoaded', function (event) {
//     checkCompletedness(challenge)

//     Object.keys(data.contents).forEach(function (key) {
//       if (data.contents[key].completed) {
//         document.getElementById(key).classList.add('completed')
//       }
//     })
//   })

//   function checkCompletedness (challenge) {
//     data = userData.getData()
//     if (data.contents[challenge].completed) {
//       document.getElementById(challenge).classList.add('completed')
//       const header = document.getElementsByTagName('header')[0]
//       header.className += ' challenge-is-completed'
//       // If completed, show clear button and disable verify button
//       enableClearStatus(challenge)
//       disableVerifyButtons(true)
//     } else removeClearStatus()
//   }
// }



module.exports.enableClearStatus = enableClearStatus
module.exports.updatePage = updatePage
// module.exports.completed = completed
// module.exports.disableVerifyButtons = disableVerifyButtons
// module.exports.challengeIncomplete = challengeIncomplete
