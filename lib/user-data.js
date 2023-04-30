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

const writeData = function (data) {
  fs.writeFile(data.path, JSON.stringify(data.contents, null, ' '), function updatedUserData (err) {
    if (err) return console.log(err)
  })
}

// this could take in a boolean on compelte status
// and be named better in re: to updating ONE challenge, not all
const updateData = function (challenge) {
  const data = getDataFromFile()
  data.contents[challenge].completed = true

  writeData(data)
}
const updateCurrentDirectory = function (path) {
  const data = getSavedDir()
  data.contents.savedDir = path

  writeData(data)
}

module.exports.getDataFromFile = getDataFromFile
module.exports.getSavedDir = getSavedDir
module.exports.updateData = updateData
module.exports.updateCurrentDirectory = updateCurrentDirectory
