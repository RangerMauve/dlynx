const Blessed = require('blessed');
const Contrib = require('blessed-contrib')
const fetch = require('make-fetch-happen').defaults()

const TurndownService = require('turndown')
const turndownService = new TurndownService()

turndownService.remove('script')
turndownService.remove('style')
turndownService.remove('img')

const {
  Screen,
  Box,
  Textbox
} = Blessed

const {
  markdown: Markdown
} = Contrib

// console.error = () => {
//   // Oh well, we'll figure this out later
// }

// Create a screen object.
const screen = Blessed.screen({
  autoPadding: true,
    smartCSR: true,
    useBCE: true,
    cursor: {
      artificial: false,
      blink: true,
      shape: 'underline'
    },
    fullUnicode: true,
    dockBorders: true,
    ignoreLocked: ['C-c'],
});

screen.title = 'dlynx';

const welcomeMessage = `
Welcome to {bold}dlynx!{/bold}

Press {bold}ctrl+l{/bold} to open the omnibar

Press {bold}esc{/bold} to unfocus

Press {bold}ctrl+q{/bold} to quit
`

const welcome = Box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '50%',
  content: welcomeMessage,
  tags: true,
  border: {
    type: 'line'
  }
})

const omnibar = Textbox({
  width: '100%',
  height: 1,
  top: 0,

  autoPadding: true,
  inputOnFocus: true,
  style: {
    fg: 'black',
    bg: 'white',
  }
})

const contents = Markdown({
  scrollable : true,
  alwaysScroll: true,
  keys: true,
  mouse: true,
  width: '100%',
  height: '100%',
  border: {
    type: 'line'
  }
})

let contentAppended = false

const NO_PROTOCOL = /^\w+:\/\//
const NO_SPACES = /^[^ ]+$/

omnibar.on('submit', async () => {
  const value = omnibar.getValue()
  omnibar.clearValue()

  welcome.detach()
  omnibar.detach()
  omnibarPresent = false

  let url = value

  if(!url.match(NO_PROTOCOL)) {
    if(url.match(NO_SPACES)) {
      if(url.includes('.')) url = `https://${value}`
      else url = `https://en.wikipedia.org/wiki/${value}`
    } else {
      url = `https://duckduckgo.com/html?q=${escape(value)}`
    }
  }

  const response = await fetch(url)

  const contentType = response.headers.get('content-type')

  const text = await response.text()

  let toRender = text
  if(contentType.includes('html')) {
    try {
      toRender = turndownService.turndown(text)
    } catch(e) {
    // Oh well
    }
  } else if(contentType.includes('json')) {
    try {
      const parsed = JSON.parse(text)
      const stringified = JSON.stringify(parsed, null, '  ')
      toRender = '```json\n' + stringified + '\n```'
    } catch(e) {
      // Oh well
    }
  }

  if(!contentAppended) {
    screen.append(contents)
    contentAppended = true
  }
  contents.setMarkdown(toRender)
  contents.focus()

  screen.render()
})

let omnibarPresent = false

screen.append(welcome)

screen.key('C-q', () => {
  return process.exit(0)
})

screen.key('C-l', () => {
  if(omnibarPresent) return
  omnibarPresent = true

  screen.append(omnibar)
  omnibar.focus()

  screen.render()
})

screen.render()
