const { contextBridge, ipcRenderer, shell } = require('electron')
// const fs = require('fs')
const fs = require('node:fs')
const path = require('node:path');
// const ipc = require('electron').ipcRenderer


contextBridge.exposeInMainWorld('electronAPI', {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
})

contextBridge.exposeInMainWorld('challengesCompleted', {
  confirmClear: () => ipcRenderer.invoke('dialog:confirmClear'),
  confirmClearResponse: (callback) => ipcRenderer.on('dialog:confirmClearResponse', callback),
  writeUserData: (data) => fs.writeFileSync(data.path, JSON.stringify(data.contents, null, 2)),
  nextChallengePath: (data, challenge) => path.join(__dirname, '..', 'challenges', data[challenge].next_challenge + '.html'),
})

contextBridge.exposeInMainWorld('userData', { 
  getData: () => {
    const data = {}
    data.path = ipcRenderer.sendSync('getUserDataPath', null)
    data.contents = JSON.parse(fs.readFileSync(data.path))
    return data
  },
  getSavedDir: () => {
    const savedDir = {}
    savedDir.path = ipcRenderer.sendSync('getUserSavedDir', null)
    savedDir.contents = JSON.parse(fs.readFileSync(savedDir.path))
    return savedDir
  },
  writeData: (data) => {
    fs.writeFile(data.path, JSON.stringify(data.contents, null, ' '), function updatedUserData (err) {
      if (err) return console.log(err)
    })
  },
  updateData: (challenge) => {
    const data = getData()
    data.contents[challenge].completed = true
    this.writeData(data)
  },
  updateCurrentDirectory: (path) => {
    const data = getSavedDir()
    data.contents.savedDir = path
    this.writeData(data)
  }
})

contextBridge.exposeInMainWorld('handleExternalLinks', {
  openExternalLink: (url) => shell.openExternal(url),
})
