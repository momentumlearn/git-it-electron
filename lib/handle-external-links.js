//
// This file is used by ever web page to make sure all links that are not local
// are opened in the users default browser.
//

const shell = require('electron').shell

document.addEventListener('DOMContentLoaded', function (event) {
  const links = document.querySelectorAll('a[href]')
  const array = []
  array.forEach.call(links, function (link) {
    const url = link.getAttribute('href')
    if (url.indexOf('http') > -1) {
      link.addEventListener('click', function (e) {
        e.preventDefault()
        shell.openExternal(url)
      })
    }
  })
})
