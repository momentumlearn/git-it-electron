//
// Touches the DOM.
// This file listens to events from the language selector and changes the
// DOM to have the language requested.
// Uses globals from chal-header.html.
//

// Selecting the current locale
const selector = document.getElementById('lang-select')

// add change listener
selector.addEventListener('change', function (event) {
  // Go to page in the locale specified
  const location = window.location
  const url = location.href.replace(/built\/([a-z]{2}-[A-Z]{2})/, 'built/' + selector.value)
  location.href = url
})
