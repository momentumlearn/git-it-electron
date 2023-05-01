const { contextBridge, ipcRenderer } = require('electron')

// const fs = require('node:fs')

// const ipc = require('electron').ipcRenderer


contextBridge.exposeInMainWorld('electronAPI', {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
})

contextBridge.exposeInMainWorld('challengesCompleted', {
  confirmClear: () => ipcRenderer.invoke('dialog:confirmClear'),
  confirmClearResponse: (callback) => ipcRenderer.on('dialog:confirmClearResponse', callback),
  writeUserData: (data) => ipcRenderer.send('writeUserData', data),
})

contextBridge.exposeInMainWorld('userData', { 
  getData: () => ipcRenderer.invoke('getData', null),
  getSavedDir: () => ipcRenderer.invoke('getSavedDir', null),
  updateCurrentDirectory: (dirPath) => ipcRenderer.invoke('updateCurrentDirectory', dirPath),
})

contextBridge.exposeInMainWorld('challenges', {
  verifyChallenge: (currentChallenge, path) => ipcRenderer.invoke('verifyChallenge', currentChallenge, path),
  markChallengeComplete: (challenge) => ipcRenderer.send('markChallengeComplete', challenge),
  resetChallenge: (challenge) => ipcRenderer.send('resetChallenge', challenge),
})

contextBridge.exposeInMainWorld('handleExternalLinks', {
  openExternalLink: (url) => ipcRenderer.invoke('openExternalLink', url),
})

contextBridge.exposeInMainWorld('challengeHelper', {
  onDisplayResults: (callback) => ipcRenderer.on('displayResults', callback),
  onError: (callback) => ipcRenderer.on('error', callback),
  onChallengeComplete: (callback) => ipcRenderer.on('challengeComplete', callback),
  onChallengeIncomplete: (callback) => ipcRenderer.on('challengeIncomplete', callback),
})
