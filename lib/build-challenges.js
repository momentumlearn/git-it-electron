//
// This file builds out the challenge web pages. A simple static site
// generator. It uses `partials` and `layouts`.
//

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const Handlebars = require('handlebars')
const locale = require('./locale.js')
const translateLocale = require('./translate-locale.js')

const layout = fs.readFileSync(path.normalize(path.join(__dirname, '../resources/layouts/challenge.hbs'))).toString()
let files = []

// Take in a language type if any
const langs = locale.getAvaiableLocales()
let input = ''
let output = ''

// If built not exist, create one
try {
  fs.accessSync(path.join(locale.getLocaleBuiltPath(langs[0]), '..'))
} catch (e) {
  fs.mkdirSync(path.join(locale.getLocaleBuiltPath(langs[0]), '..'))
}

for (const lang in langs) {
  // If locale folder not exist, create one.
  try {
    fs.accessSync(locale.getLocaleBuiltPath(langs[lang]))
  } catch (e) {
    fs.mkdirSync(locale.getLocaleBuiltPath(langs[lang]))
  }
  input = path.join(locale.getLocaleResourcesPath(langs[lang]), 'challenges')
  output = path.join(locale.getLocaleBuiltPath(langs[lang]), 'challenges')
  try {
    fs.accessSync(output)
  } catch (e) {
    fs.mkdirSync(output)
  }
  // I can probably use glob better to avoid
  // finding the right files within the files
  files = glob.sync('*.html', { cwd: input })
  buildChallenges(files, langs[lang])
}

function buildChallenges (files, lang) {
  files.forEach(function (file) {
    // shouldn't have to do this if my
    // mapping were correct
    if (!file || !lang) return

    // if language, run the noun and verb
    // translations

    const content = {
      header: buildHeader(file, lang),
      sidebar: buildSidebar(file, lang),
      footer: buildFooter(file, lang),
      body: buildBody(file, lang)
    }

    if (lang && lang !== 'en-US') {
      content.body = translateLocale(content.body, lang)
    }

    content.shortname = makeShortname(file).replace('.', '')
    const template = Handlebars.compile(layout)
    const final = template(content)
    fs.writeFileSync(path.join(output, content.shortname + '.html'), final)
  })
  // hard coded right now because, reasons
  console.log('Built ' + lang + ' challenges!')
}

function makeShortname (filename) {
  // BEFORE guide/challenge-content/10_merge_tada.html
  // AFTER  merge_tada
  return filename.split('/').pop().split('_')
    .slice(1).join('_').replace('html', '')
}

function makeTitleName (filename, lang) {
  const short = makeShortname(filename).split('_').join(' ').replace('.', '')
  return grammarize(short, lang)
}

function makeTitle (title, lang) {
  const short = title.split('_').join(' ').replace('.', '')
  return grammarize(short, lang)
}

function buildHeader (filename, lang) {
  const num = filename.split('/').pop().split('_')[0]
  const data = getPrevious(num, lang)
  const title = makeTitleName(filename)
  const source = fs.readFileSync(getPartial('chal-header', lang)).toString().trim()
  const template = Handlebars.compile(source)
  const content = {
    challengetitle: title,
    challengenumber: num,
    localemenu: new Handlebars.SafeString(locale.getLocaleMenu(lang)),
    lang,
    preurl: data.preurl,
    nexturl: data.nexturl
  }
  return template(content)
}

function buildSidebar (filename, lang) {
  const currentTitle = makeTitleName(filename)
  const challenges = Object.keys(require('../empty-data.json')).map(function (title) {
    const currentChallenge = currentTitle === makeTitle(title)
    return [title, makeTitle(title), currentChallenge]
  })
  const num = filename.split('/').pop().split('_')[0]
  const data = getPrevious(num, lang)
  const source = fs.readFileSync(getPartial('chal-sidebar', lang)).toString().trim()
  const template = Handlebars.compile(source)
  const content = {
    challenges,
    challengetitle: currentTitle,
    challengenumber: num,
    lang,
    preurl: data.preurl,
    nexturl: data.nexturl
  }
  return template(content)
}

function grammarize (name, lang) {
  let correct = name
  const wrongWords = ['arent', 'githubbin', 'its']
  const rightWords = ["aren't", 'GitHubbin', "it's"]

  wrongWords.forEach(function (word, i) {
    if (name.match(word)) {
      correct = name.replace(word, rightWords[i])
    }
  })
  return correct
}

function buildFooter (file, lang) {
  const num = file.split('/').pop().split('_')[0]
  const data = getPrevious(num, lang)
  const source = fs.readFileSync(getPartial('chal-footer', lang)).toString().trim()
  data.lang = lang
  const template = Handlebars.compile(source)
  return template(data)
}

function buildBody (file, lang) {
  const source = fs.readFileSync(path.join(input, file)).toString()
  const template = Handlebars.compile(source)

  const content = {
    verify_button: fs.readFileSync(getPartial('verify-button', lang)).toString().trim(),
    verify_directory_button: fs.readFileSync(getPartial('verify-directory-button', lang)).toString().trim()
  }

  return template(content)
}

function getPrevious (num, lang) {
  const pre = parseInt(num, 10) - 1
  const next = parseInt(num, 10) + 1
  let preurl = ''
  let prename = ''
  let nexturl = ''
  let nextname = ''
  files.forEach(function (file) {
    const regexPre = '(^|[^0-9])' + pre + '([^0-9]|$)'
    const regexNext = '(^|[^0-9])' + next + '([^0-9]|$)'
    if (pre === 0) {
      prename = 'All Challenges'
      preurl = path.join('../', 'pages', 'index.html')
    } else if (file.match(regexPre)) {
      prename = makeTitleName(file, lang)
      const getridof = pre + '_'
      preurl = file.replace(getridof, '')
    }
    if (next === 12) {
      nextname = 'Done!'
      nexturl = path.join('../', 'pages', 'index.html')
    } else if (file.match(regexNext)) {
      nextname = makeTitleName(file, lang)
      const getridof = next + '_'
      nexturl = file.replace(getridof, '')
    }
  })
  return {
    prename,
    preurl,
    nextname,
    nexturl
  }
}

function getPartial (filename, lang) {
  try {
    const pos = path.join(locale.getLocaleResourcesPath(lang), 'partials/' + filename + '.html')
    fs.statSync(pos)
    return pos
  } catch (e) {
    return path.join(locale.getLocaleResourcesPath(locale.getFallbackLocale()), 'partials/' + filename + '.html')
  }
}
