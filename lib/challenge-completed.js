console.log("challenge-completed.js loaded")
// MAIN
// // This file touches the DOM and provides an API for setting the page after
// // challenge has been completed by toggling the buttons that are disabled
// // or enabled. It as updates user-data.
// //
// // It is required by each challenge's verify file.
// //

// const fs = require('fs')



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



module.exports.enableClearStatus = enableClearStatus
module.exports.updatePage = updatePage
// module.exports.completed = completed
// module.exports.disableVerifyButtons = disableVerifyButtons
// module.exports.challengeIncomplete = challengeIncomplete
