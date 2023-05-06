require('dotenv').config()
const fs = require('fs')
const path = require('path')
const userData = require(path.join(__dirname, './lib/user-data.js'))

const electron = require('electron')
const locale = require('./lib/locale.js')
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu

const { app, ipcMain, dialog, shell } = electron

const darwinTemplate = require('./menus/darwin-menu.js')
const otherTemplate = require('./menus/other-menu.js')

const emptyData = require('./empty-data.json')
const emptySavedDir = require('./empty-saved-dir.json')

let mainWindow = null
let menu = null

const iconPath = path.join(__dirname, '/assets/git-it.png')

app.on('window-all-closed', function appQuit () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', function appReady () {
  mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    // width: 980,
    width: 1280,
    // height: 760,
    height: 900,
    title: 'Git-it',
    icon: iconPath,
    webPreferences: {
      // nodeIntegration: true,
      // sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  const appPath = app.getPath('userData')

  const userDataPath = path.join(appPath, 'user-data.json')
  const userSavedDir = path.join(appPath, 'saved-dir.json')
  const language = locale.getLocale(app.getLocale())
  // tools for development to prefill challenge completion
  // usage: electron . --none
  //        electron . --some
  //        electron . --all
  if (process.argv[2] === '--none') {
    setAllChallengesUncomplete(userDataPath)
  }
  if (process.argv[2] === '--some') {
    setSomeChallengesComplete(userDataPath)
  }
  if (process.argv[2] === '--all') {
    setAllChallengesComplete(userDataPath)
  }

  fs.exists(userDataPath, function (exists) {
    if (!exists) {
      fs.writeFile(userDataPath, JSON.stringify(emptyData, null, ' '), function (err) {
        if (err) return console.log(err)
      })
    }
  })

  fs.exists(userSavedDir, function (exists) {
    if (!exists) {
      fs.writeFile(userSavedDir, JSON.stringify(emptySavedDir, null, ' '), function (err) {
        if (err) return console.log(err)
      })
    }
  })
  
  console.log("LOCALE: ", locale.getLocaleBuiltPath(language))
  mainWindow.loadURL('file://' + locale.getLocaleBuiltPath(language) + '/pages/index.html')
  
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }
  
  ipcMain.on('openExternalLink', (event, url) => {
    shell.openExternal(url)
  })
  
  ipcMain.on('markChallengeComplete', (event, challenge) => {
    userData.markChallengeComplete(challenge)
  })
  
  ipcMain.on('resetChallenge', (event, challenge) => {
    userData.resetChallenge(challenge)
  })
  
  ipcMain.on('writeUserData', (event, data) => {
    fs.writeFileSync(data.path, JSON.stringify(data.contents, null, 2))
  })
  
  ipcMain.on('readUserDataFromFile', (event, path) => {
    return JSON.parse(fs.readFileSync(path))
  })
  
  ipcMain.handle('verifyChallenge', async (event, currentChallenge, path) => {
    verify = require('./lib/verify/' + currentChallenge + '.js')
    // event.returnValue = await verify(path)
    return await verify(path)
  })
  
  ipcMain.handle('getData', (event) => {
    const data = userData.getDataFromFile()
    return data
  })

  ipcMain.handle('getSavedDir', (event) => {
    const data = userData.getSavedDir()
    return data
  })
  
  ipcMain.handle('updateCurrentDirectory', (event, dirPath) => {
    userData.updateCurrentDirectory(dirPath)
  })

  ipcMain.on('open-file-dialog', function (event) {
    const files = dialog.showOpenDialog(mainWindow, { properties: ['openFile', 'openDirectory'] })
    if (files) {
      event.sender.send('selected-directory', files)
    }
  })

  ipcMain.on('confirm-clear', function (event) {
    const options = {
      type: 'info',
      buttons: ['Yes', 'No'],
      title: 'Confirm Clearing Statuses',
      message: 'Are you sure you want to clear the status for every challenge?'
    }
    dialog.showMessageBox(options, function cb (response) {
      event.sender.send('confirm-clear-response', response)
    })
  })
  
  ipcMain.handle('dialog:openDirectory', async (event) => {
    console.log("openDirectory handler called")
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, { properties: ['openFile', 'openDirectory'] })
    if (canceled) {
      return
    } else {
      event.sender.send('resetDisplayedErrors')
      return filePaths[0]
    }
  })

  if (process.platform === 'darwin') {
    menu = Menu.buildFromTemplate(darwinTemplate(app, mainWindow))
    Menu.setApplicationMenu(menu)
  } else {
    menu = Menu.buildFromTemplate(otherTemplate(app, mainWindow))
    mainWindow.setMenu(menu)
  }

  mainWindow.on('closed', function winClosed () {
    mainWindow = null
  })
})

function setAllChallengesComplete (path) {
  const challenges = JSON.parse(fs.readFileSync(path))
  for (const key in challenges) {
    challenges[key].completed = true
  }
  fs.writeFileSync(path, JSON.stringify(challenges), '', null)
}

function setAllChallengesUncomplete (path) {
  const challenges = JSON.parse(fs.readFileSync(path))
  for (const key in challenges) {
    challenges[key].completed = false
  }
  fs.writeFileSync(path, JSON.stringify(challenges), '', null)
}

function setSomeChallengesComplete (path) {
  let counter = 0
  const challenges = JSON.parse(fs.readFileSync(path))
  for (const key in challenges) {
    counter++
    challenges[key].completed = counter < 6
  }
  fs.writeFileSync(path, JSON.stringify(challenges), '', null)
}
