// RENDERER PROCESS
// This file is loaded by every challenge's HTML, it listens to events on the
// verify button and provides the file-chooser dialog when the challenge needs.
// It also provides the logic for displaying the results of a challenge's verify

const selectDirBtn = document.getElementById('select-directory')
const currentChallenge = document.getElementById('current-challenge-container').dataset.currentChallenge
// const userData = window.userData.getData().contents
console.log("currentChallenge: ", currentChallenge)

const selectDirectory = function (path) {
  if (!path) return
  console.log("selectDirectory called")
  document.getElementById('path-required-warning').classList.remove('show')
  document.getElementById('directory-path').innerText = path
}

document.addEventListener('DOMContentLoaded', async (event) => {
  const data = await window.userData.getData()
  const savedDirData = await window.userData.getSavedDir()
  const currentDirectory = savedDirData.contents.savedDir
  const challengeCompleted = data.contents[currentChallenge].completed

  if (currentChallenge === 'forks_and_clones') {
    // on this challenge clear out the saved dir because it should change
    window.userData.updateCurrentDirectory(null)
  } else if (selectDirBtn && currentDirectory && !challengeCompleted) {
    selectDirectory(currentDirectory)
    selectDirBtn.innerHTML = 'CHANGE DIRECTORY'
  }
  
  if (selectDirBtn) {
    selectDirBtn.addEventListener('click', async () => {
      const dirPath = await window.electronAPI.openDirectory()
      selectDirectory(dirPath)
      await window.userData.updateCurrentDirectory(dirPath)
    })
  }
})

const verifyWithDirectory = async () => {
    const path = document.getElementById('directory-path').innerText
    if (path === '') {
      document.getElementById('path-required-warning').classList.add('show')
    } else {
      document.getElementById('verify-list').innerHTML = ''
      results = await window.challenges.verifyChallenge(currentChallenge, path).catch(err => console.log("🧲 ", err.message))
      return results
    }
}

const verifyWithoutDirectory = async () => {
  document.getElementById('verify-list').innerHTML = ''
  results = await window.challenges.verifyChallenge(currentChallenge).catch(err => { 
    console.log("OH NOES") })
    return results
}

// Handle verify challenge click
document.getElementById('verify-challenge').addEventListener('click', async (event) => {
  console.log("verifyChallenge called 🥝")
  //reset the results list
  document.getElementById("verify-try-again").innerHTML = ""
  // verify
  let results = selectDirBtn ? await verifyWithDirectory() : await verifyWithoutDirectory()
  // display results
  console.log("Calling displayResults from event listener in challenge.js")
  console.log("results: ", results)
  // displayResults(results) //defined in challenge-helpers.js, which is loaded in the HTML before
})

window.addEventListener('load', (event) => {
  const completedChallenges = JSON.parse(window.localStorage.getItem('completedChallenges'))
  console.log("completedChallenges: ", completedChallenges)
  for (let challengeItem of document.getElementsByClassName("challenge-item")){
    if (completedChallenges.includes(challengeItem.id)) {
      challengeItem.classList.add('completed')
    }
  }
})
