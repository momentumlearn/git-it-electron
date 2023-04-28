//
// Renderer Process—This file is required by the index page.
// It touches the DOM by showing progress in challenge completion.
// It also handles the clear buttons and writing to user-data.
//



document.addEventListener('DOMContentLoaded', function (event) {
  // get user data from preloaded
  const userData = window.userData.getData()

  // Buttons
  const clearAllButtons = document.querySelectorAll('.js-clear-all-challenges')
  const leftOffButton = document.getElementById('left-off-from')
  // Sections
  const showFirstRun = document.getElementById('show-first-run')
  const showWipRun = document.getElementById('show-wip-run')
  const showFinishedRun = document.getElementById('show-finished-run')

  updateIndex(userData.contents)

  // Listen for Clear All Button Events, trigger confirmation dialog
  for (let i = 0; i < clearAllButtons.length; i++) {
    clearAllButtons[i].addEventListener('click', function () {
      window.confirmClear()
    }, false)
  }
  
  const clearChallenges = (response) => {
    if (response === 1) return
    else clearAllChallenges(data)
  }
  window.challengesCompleted.confirmClearResponse(clearChallenges)
  
  // ipc.on('confirm-clear-response', function (event, response) {
  //   if (response === 1) return
  //   else clearAllChallenges(data)
  // })

  // Go through each challenge in user data to see which are completed
  function updateIndex (data) {
    const circles = document.querySelectorAll('.progress-circle')
    let counter = 0
    let completed = 0

    for (const chal in data) {
      if (data[chal].completed) {
        // A challenge is completed so show the WIP run HTML
        showWipRun.style.display = 'block'
        showFirstRun.style.display = 'none'
        showFinishedRun.style.display = 'none'
        // Mark the corresponding circle as completed
        circles[counter].classList.add('completed')
        // Show the button to go to next challenge
        leftOffButton.href = window.challengesCompleted.nextChallengePath(data, chal)
        completed++
        counter++
      } else {
        counter++
      }
    }

    if (completed === 0) {
      // No challenges are complete, show the first run HTML
      showFirstRun.style.display = 'block'
      showWipRun.style.display = 'none'
      showFinishedRun.style.display = 'none'
    }

    // if (completed === Object.keys(data).length) {
    //   // All of the challenges are complete! Show the finished run HTML
    //   showFirstRun.style.display = 'none'
    //   showWipRun.style.display = 'none'
    //   showFinishedRun.style.display = 'block'
    // }
  }

  function clearAllChallenges (data) {
    for (const chal in data.contents) {
      if (data.contents[chal].completed) {
        data.contents[chal].completed = false
      }
    }
    //  Write to user data
    window.challengesCompleted.writeUserData(data)
    // If they clear all challenges, go back to first run HTML
    const circles = document.querySelectorAll('.progress-circle')
    Array.prototype.forEach.call(circles, function (el) {
      el.classList.remove('completed')
    })

    showFirstRun.style.display = 'block'
    showWipRun.style.display = 'none'
    showFinishedRun.style.display = 'none'
  }
})
