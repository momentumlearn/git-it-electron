// RENDERER PROCESS
// This file is loaded by every challenge's HTML, it listens to events on the
// verify button and provides the file-chooser dialog when the challenge needs.

console.log("challenge.js loaded")
const selectDirBtn = document.getElementById('select-directory')
const currentChallenge = document.getElementById('current-challenge-container').dataset.currentChallenge
const selectDirectory = function (path) {
  document.getElementById('path-required-warning').classList.remove('show')
  document.getElementById('directory-path').innerText = path
}

if (selectDirBtn) {
  selectDirBtn.addEventListener('click', async () => {
    const directoryPath = await window.electronAPI.openDirectory()
    selectDirectory(directoryPath)
    userData.updateCurrentDirectory(directoryPath)
  })
}

const currentDirectory = window.userData.getSavedDir()
console.log("currentDirectory: ", currentDirectory)
// const challengeCompleted = window.userData.getData()
// console.log("challengeCompleted: ", challengeCompleted)
if (currentChallenge === 'forks_and_clones') {
  // on this challenge clear out the saved dir because it should change
  window.userData.updateCurrentDirectory(null)
} else if (selectDirBtn && currentDirectory && !challengeCompleted[currentChallenge].completed) {
  selectDirectory(currentDirectory)
  selectDirBtn.innerHTML = 'CHANGE DIRECTORY'
}

// Handle verify challenge click
document.getElementById('verify-challenge').addEventListener('click', async (event) => {
  // const verifyChallenge = await window.challengeScript.verifyChallenge(currentChallenge)

  console.log("verifyChallenge called 🥝")
  // If a directory is needed
  if (selectDirBtn) {
    const path = document.getElementById('directory-path').innerText

    if (path === '') {
      document.getElementById('path-required-warning').classList.add('show')
    } else {
      document.getElementById('verify-list').innerHTML = ''
      verifyChallenge(path)
    }
  } else {
    document.getElementById('verify-list').innerHTML = ''
    await window.challenges.verifyChallenge(currentChallenge)
  }
})

window.addEventListener('load', (event) => {
  console.log("load event fired 🍓")
  const completedChallenges = JSON.parse(window.localStorage.getItem('completedChallenges'))
  console.log("completedChallenges: ", completedChallenges)
  for (let challengeItem of document.getElementsByClassName("challenge-item")){
    if (completedChallenges.includes(challengeItem.id)) {
      challengeItem.classList.add('completed')
    }
  }
})
