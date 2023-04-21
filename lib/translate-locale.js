const fs = require('fs')
const cheerio = require('cheerio')

module.exports = function translateLocale (fileContent, lang) {
  if (!lang) return

  // get translation data
  const translations = JSON.parse(fs.readFileSync(__dirname + '/locale-' + lang + '.json'))

  // load file into Cheerio
  const $ = cheerio.load(fileContent)

  const types = ['n', 'v', 'adj']

  types.forEach(function (type) {
    $(type).each(function (i, tag) {
      const word = $(tag).text().toLowerCase()
      let translation

      if (!translations[type][word]) {
        return console.log("Didn't find translation for ", type, word)
      } else {
        translation = translations[type][word]
      }

      const span = "<span class='superscript'>" + translation + '</span>'
      $(tag).prepend(span)
    })
  })
  return ($.html())
}
