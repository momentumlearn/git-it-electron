const ul = document.getElementById('verify-list')
const directoryPathContent = document.getElementById('directory-path')
const resetButton = document.getElementById('clear-completed-status')

let spinner
const startSpinner = () => (spinner = setTimeout(spinnerDelay, 100))

const spinnerDelay = function () {
  // If clear button exists then challenge is completed
  if (resetButton.style.display === 'none') {
    const verifySpinner = document.getElementById('verify-spinner')
    verifySpinner.style.display = 'inline-block'
  }
}

const showResultsDiv = () => {
  const resultsDiv = document.getElementById('verify-list')
  resultsDiv.style.display = 'block'
}

const updatePage = () => {
  if (
    directoryPathContent &&
    directoryPathContent.innerText &&
    !directoryPathContent.innerText.match(/Please select/)
  ) {
    document.getElementById('verify-list').style.display = 'block'
    disableVerifyButtons(true)
    startSpinner()
  }
  // if there is no directory button
  if (!directoryPathContent) {
    document.getElementById('verify-list').style.display = 'block'
    disableVerifyButtons(true)
    startSpinner()
  }
}

const addResultToDOM = function (message, success) {
  const li = document.createElement('li')
  const text = document.createTextNode(message)
  li.appendChild(text)
  li.classList.add(success ? 'verify-pass' : 'verify-fail')
  ul.appendChild(li)
}

const addResultsToDOM = (results) => {
  console.log('ADD RESULTS TO DOM')
  console.log('messages: ', results)
  results &&
    results.forEach(([message, success]) => addResultToDOM(message, success))
}

const clearTryAgainMessage = () => {
  const tryAgainMessageDiv = document.getElementById('verify-try-again')
  tryAgainMessageDiv.innerText = ''
}

const displayResults = (messages) => {
  console.log('DISPLAY RESULTS')
  console.log('messages: ', messages)
  showResultsDiv()
  addResultsToDOM(messages)
}

const removeClearStatus = () => {
  resetButton.style.display = 'none'
}

const clearCompletedMessage = function () {
  document.getElementById('challenge-result').innerHTML = ''
}

const hideSpinner = () => {
  const verifySpinner = document.getElementById('verify-spinner')
  verifySpinner.style.display = 'none'
  // TODO cancel the timeout here
}

const enableClearStatus = (challenge) => {
  hideSpinner()
  disableVerifyButtons(true)

  resetButton.style.display = 'inline-block'
  resetButton.addEventListener('click', function clicked(event) {
    // set challenge to uncompleted and update the user's data file
    // send message to main process to update user data
    window.challenges.resetChallenge(challenge)

    // remove the completed status from the page and renable verify button
    document.getElementById(challenge).classList.remove('completed')
    removeChallengeFromLocalStorage(challenge)
    disableVerifyButtons(false)
    removeClearStatus()
    clearCompletedMessage()

    // if there is a list of passed parts of challenge, remove it
    const verifyList = document.getElementById('verify-list')
    if (verifyList) verifyList.style.display = 'none'
  })
}

const markChallengeCompleted = function (challenge) {
  document.getElementById(challenge).classList.add('completed')
  const completeMsgDiv = document.createElement('div')
  const completeMsg = document.createTextNode('Challenge completed! 🎉')
  completeMsgDiv.appendChild(completeMsg)
  document.getElementById('challenge-result').appendChild(completeMsgDiv)
  window.challenges.markChallengeComplete(challenge)
  updateCompletedChallengesInLocalStorage(challenge)
  console.log('challenge completed')
  console.log('Challenge: ', challenge)
}

const removeChallengeFromLocalStorage = (challenge) => {
  const currentCompletedChallenges = JSON.parse(
    window.localStorage.getItem('completedChallenges')
  )
  const newCompletedChallenges = currentCompletedChallenges.filter(
    (completedChallenge) => completedChallenge !== challenge
  )
  window.localStorage.setItem(
    'completedChallenges',
    JSON.stringify(newCompletedChallenges)
  )
}

const updateCompletedChallengesInLocalStorage = (challenge) => {
  const currentCompletedChallenges = JSON.parse(
    window.localStorage.getItem('completedChallenges')
  )
  window.localStorage.setItem(
    'completedChallenges',
    JSON.stringify([...currentCompletedChallenges, challenge])
  )
}

const showTryAgainMessage = () => {
  const tryAgainMessageDiv = document.getElementById('verify-try-again')
  const text = document.createTextNode(
    'Fix the errors by checking the steps above, and then click verify again.'
  )
  tryAgainMessageDiv.appendChild(text)
}

const disableVerifyButtons = function (boolean) {
  document.getElementById('verify-challenge').disabled = boolean
  const directoryButton = document.getElementById('select-directory')
  if (directoryButton) {
    directoryButton.disabled = boolean
  }
}

const challengeIncomplete = function () {
  clearTimeout(spinner)
  showTryAgainMessage()
  // re-enable the verify button
  disableVerifyButtons(false)
  const verifySpinner = document.getElementById('verify-spinner')
  verifySpinner.style.display = 'none'
}

//  LISTENERS
// events from main to renderer
window.challengeHelper.onDisplayResults((event, messages) => {
  console.log('DISPLAY RESULTS -- RENDERER')
  console.log('messages: ', messages)
  displayResults(messages)
})

window.challengeHelper.onChallengeComplete((event, challenge, results) => {
  console.log('Received challenge completed message')
  displayResults(results)
  markChallengeCompleted(challenge)
  updatePage()
  enableClearStatus(challenge)
})

window.challengeHelper.onChallengeIncomplete((event, results) => {
  console.log('challenge incomplete')
  if (results) displayResults(results)
  challengeIncomplete()
})

window.challengeHelper.onError((event, error) => {
  console.log('error in ChallengeHelper: ', error)
  addResultToDOM('Error: ' + error, false)
  challengeIncomplete()
})

window.challengeHelper.onResetDisplayedErrors((event) => {
  console.log('resetting displayed errors')
  clearTryAgainMessage()
})
