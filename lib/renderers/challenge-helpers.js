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

const removeClearStatus = () => {
  resetButton.style.display = 'none'
}

const clearCompletedMessage = function () {
  document.getElementById('challenge-result').innerHTML = ''
}

const enableClearStatus = (challenge) => {
  // hide spinner
  // TODO cancel the timeout here
  const verifySpinner = document.getElementById('verify-spinner')
  verifySpinner.style.display = 'none'
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

const addResultToDOM = function (message, success) {
  const li = document.createElement('li')
  const text = document.createTextNode(message)
  li.appendChild(text)
  li.classList.add(success ? 'verify-pass' : 'verify-fail')
  ul.appendChild(li)
}

const addResultsToDOM = (messages) => {
  console.log('ADD RESULTS TO DOM')
  console.log('messages: ', messages)
  messages.forEach(([message, success]) => addResultToDOM(message, success))
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
  tryAgainMessageDiv.innerHTML =
    'Fix the errors by checking the steps above, and then click verify again.'
}

const disableVerifyButtons = function (boolean) {
  document.getElementById('verify-challenge').disabled = boolean
  const directoryButton = document.getElementById('select-directory')
  if (directoryButton) {
    document.getElementById('select-directory').disabled = boolean
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
  updatePage()
  addResultsToDOM(messages)
})

window.challengeHelper.onChallengeComplete((event, challenge) => {
  console.log('Received challenge completed message')
  markChallengeCompleted(challenge)
  updatePage()
  enableClearStatus(challenge)
})

window.challengeHelper.onChallengeIncomplete((event) => {
  console.log('challenge incomplete')
  challengeIncomplete()
})

window.challengeHelper.onError((error) => {
  addResultToDOM('Error: ' + error, false)
})
