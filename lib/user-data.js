//
// This file talks to the main process by fetching the path to the user data.
// It also writes updates to the user-data file.
//
const electron = require('electron')
const fs = require('fs')
const path = require('path')
const app = electron.app
const userDataDir = app.getPath('userData')

const getDataFromFile = () => {
  const data = {}
  userDataPath = path.join(userDataDir, 'user-data.json')
  data.path = userDataPath
  data.contents = JSON.parse(fs.readFileSync(data.path))
  return data
}

const getSavedDir = () => {
  const userSavedDir = path.join(userDataDir, 'saved-dir.json')
  const savedDir = {}
  savedDir.path = userSavedDir
  savedDir.contents = JSON.parse(fs.readFileSync(userSavedDir))
  return savedDir
}

const writeToFile = function (data) {
  fs.writeFile(data.path, JSON.stringify(data.contents, null, ' '), (err) => {
    if (err) return console.log(err)
  })
}

const markChallengeComplete = (challenge) => {
  console.log("marking challenge complete: ", challenge)
  const data = getDataFromFile()
  data.contents[challenge].completed = true
  writeToFile(data)
}

const resetChallenge = (challenge) => {
  console.log("resetting challenge: ", challenge)
  const data = getDataFromFile()
  data.contents[challenge].completed = false
  writeToFile(data)
}

const updateCurrentDirectory = function (path) {
  const data = getSavedDir()
  data.contents.savedDir = path

  writeData(data)
}

module.exports.getDataFromFile = getDataFromFile
module.exports.getSavedDir = getSavedDir
module.exports.updateCurrentDirectory = updateCurrentDirectory
module.exports.resetChallenge = resetChallenge
module.exports.markChallengeComplete = markChallengeComplete
