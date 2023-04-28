//
// This file is loaded by every challenge's HTML, it listens to events on the
// verify button and provides the file-chooser dialog when the challenge needs.

const path = require('path')

const userData = require(path.normalize(path.join(__dirname, 'user-data.js')))
const selectDirBtn = document.getElementById('select-directory')
const currentChallenge = window.currentChallenge

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

const currentDirectory = userData.getSavedDir().contents.savedDir
const challengeCompleted = userData.getData().contents
if (currentChallenge === 'forks_and_clones') {
  // on this challenge clear out the saved dir because it should change
  userData.updateCurrentDirectory(null)
} else if (selectDirBtn && currentDirectory && !challengeCompleted[currentChallenge].completed) {
  selectDirectory(currentDirectory)
  selectDirBtn.innerHTML = 'CHANGE DIRECTORY'
}

// Handle verify challenge click
document.getElementById('verify-challenge').addEventListener('click', function clicked (event) {
  const verifyChallenge = require('../lib/verify/' + currentChallenge + '.js')
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
    verifyChallenge()
  }
})
