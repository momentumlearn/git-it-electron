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
  updateCurrentDirectory: (path) => {
    const data = getSavedDir()
    data.contents.savedDir = path
    this.writeData(data)
  }
})

contextBridge.exposeInMainWorld('challenges', {
  verifyChallenge: (currentChallenge) => ipcRenderer.invoke('verifyChallenge', currentChallenge),
  markChallengeComplete: (challenge) => ipcRenderer.send('markChallengeComplete', challenge),
  resetChallenge: (challenge) => ipcRenderer.send('resetChallenge', challenge),
})

contextBridge.exposeInMainWorld('handleExternalLinks', {
  openExternalLink: (url) => shell.openExternal(url),
})

contextBridge.exposeInMainWorld('challengeHelper', {
  onDisplayResults: (callback) => ipcRenderer.on('displayResults', callback),
  onError: (callback) => ipcRenderer.on('error', callback),
  onChallengeComplete: (callback) => ipcRenderer.on('challengeComplete', callback),
  onChallengeIncomplete: (callback) => ipcRenderer.on('challengeIncomplete', callback),
})
