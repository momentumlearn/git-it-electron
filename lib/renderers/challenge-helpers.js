const ul = document.getElementById('verify-list')
// demo IPC from main to renderer
const counterElement = document.getElementById('counter')
window.electronAPI.onUpdateCounter((event, value) => {
  const counter = parseInt(counterElement.innerText)
  counterElement.innerText = counter + value
})

window.challengeHelper.onChallengeCompleted((event, challenge) => {
  console.log("challenge completed")
  markChallengeCompleted(challenge)

const markChallengeCompleted = function (challenge) {
  document.getElementById(challenge).classList.add('completed')
  const completeMsgDiv = document.createElement("div")
  const completeMsg = document.createTextNode("Challenge completed! 🎉")
  completeMsgDiv.appendChild(completeMsg)
  document.getElementById("challenge-result").appendChild(completeMsgDiv)
  console.log("challenge completed")
  console.log("Challenge: ", challenge)
  // completed.updatePage()
  
  // completed.enableClearStatus(challenge)
}

const addResultsToDOM = (messages) => {
  console.log("ADD RESULTS TO DOM")
  console.log("messages: ", messages)
  messages.forEach(([message, success]) => addResultToDOM(message, success))
}

const addResultToDOM = function (message, success) {
  const li = document.createElement('li')
  const text = document.createTextNode(message)
  li.appendChild(text)
  li.classList.add(success ? 'verify-pass' : 'verify-fail')
  ul.appendChild(li)
}

const showTryAgainMessage = () => {
  const tryAgainMessageDiv = document.getElementById('verify-try-again')
  tryAgainMessageDiv.innerHTML =
    'Fix the errors by checking the steps above, and then click verify again.'
}
