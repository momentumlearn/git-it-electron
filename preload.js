const { contextBridge, ipcRenderer, shell } = require('electron')

// const fs = require('node:fs')

// const ipc = require('electron').ipcRenderer


contextBridge.exposeInMainWorld('electronAPI', {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
})

contextBridge.exposeInMainWorld('challengesCompleted', {
  confirmClear: () => ipcRenderer.invoke('dialog:confirmClear'),
  confirmClearResponse: (callback) => ipcRenderer.on('dialog:confirmClearResponse', callback),
  writeUserData: (data) => ipcRenderer.send('writeUserData', data),
  nextChallengePath: (data, challenge) => ipcRenderer.send('getNextChallengePath', data, challenge),
})

contextBridge.exposeInMainWorld('userData', { 
  getData: () => ipcRenderer.invoke('getData', null),
  getSavedDir: () => ipcRenderer.invoke('getSavedDir', null),
  writeData: (data) => ipcRenderer.send('writeUserData', data),
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

contextBridge.exposeInMainWorld('challenges', {
  verifyChallenge: (currentChallenge) => ipcRenderer.invoke('verifyChallenge', currentChallenge),
})

contextBridge.exposeInMainWorld('handleExternalLinks', {
  openExternalLink: (url) => shell.openExternal(url),
})

contextBridge.exposeInMainWorld('challengeHelper', {
  onChallengeCompleted: (callback) => ipcRenderer.on('challegeCompleted', callback),
})
