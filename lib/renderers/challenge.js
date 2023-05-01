// RENDERER PROCESS
// This file is loaded by every challenge's HTML, it listens to events on the
// verify button and provides the file-chooser dialog when the challenge needs.

console.log("challenge.js loaded")
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
  console.log("data: ", data)
  const savedDirData = await window.userData.getSavedDir()
  const currentDirectory = savedDirData.contents.savedDir
  console.log("currentDirectory: ", currentDirectory)
  const challengeCompleted = data.contents[currentChallenge].completed
  console.log("challengeCompleted: ", challengeCompleted)

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
  

// Handle verify challenge click
document.getElementById('verify-challenge').addEventListener('click', async (event) => {
  // const verifyChallenge = await window.challengeScript.verifyChallenge(currentChallenge)
  document.getElementById("verify-try-again").innerHTML = ""
  console.log("verifyChallenge called 🥝")
  // If a directory is needed
  if (selectDirBtn) {
    const path = document.getElementById('directory-path').innerText

    if (path === '') {
      document.getElementById('path-required-warning').classList.add('show')
    } else {
      document.getElementById('verify-list').innerHTML = ''
      window.challenges.verifyChallenge(currentChallenge, path)
    }
  } else {
    document.getElementById('verify-list').innerHTML = ''
    await window.challenges.verifyChallenge(currentChallenge)
  }
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
