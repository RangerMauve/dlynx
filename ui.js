const Blessed = require('blessed')

const {
  Box,
  Textbox
} = Blessed

const Contrib = require('blessed-contrib')

const {
  markdown: Markdown
} = Contrib

const fetch = require('./fetch')
const convertToMD = require('./convertToMD')

const WELCOME_MESSAGE = `
# Welcome to **dlynx!**

---

Press **ctrl+l** to open the omnibar

Press **esc** to unfocus

Press **ctrl+q** to quit
`

const DEFAULT_OPTIONS = {
  width: '100%',
  height: '100%',
  fetch: require('./fetch')
}

const NO_PROTOCOL = /^\w+:\/\//
const NO_SPACES = /^[^ ]+$/

module.exports = class DLynx extends Box {
  constructor (options = {}) {
    const finalOptions = Object.assign({}, DEFAULT_OPTIONS, options)
    super(finalOptions)
    const { fetch } = finalOptions

    this.fetch = fetch

    this._contentAppended = null
    this._welcomeAppended = null
    this._omnibarAppended = null

    this.showWelcome()
  }

  async navigate (url) {
    // Load
    this.hideOmnibar()
    this.hideWelcome()

    if (!url.match(NO_PROTOCOL)) {
      if (url.match(NO_SPACES)) {
        if (url.includes('.')) url = `https://${url}`
        else url = `https://en.wikipedia.org/wiki/${url}`
      } else {
        url = `https://duckduckgo.com/html?q=${escape(url)}`
      }
    }

    const response = await fetch(url)

    const toRender = await convertToMD(response)

    const contents = Markdown({
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      mouse: true,
      width: '100%',
      height: '100%',
      border: {
        type: 'line'
      }
    })

    contents.setMarkdown(toRender)

    if (this._contentAppended) {
      this._contentAppended.detach()
    }

    this.append(contents)

    this._contentAppended = contents

    this.emit('navigated', url)
  }

  hideOmnibar () {
    if (!this._omnibarAppended) return

    this._omnibarAppended.detach()

    this._omnibarAppended = null
  }
  showOmnibar () {
    if (this._omnibarAppended) {
      this._omnibarAppended.focus()
      return
    }
    const omnibar = Textbox({
      width: '100%',
      height: 1,
      top: 0,

      autoPadding: true,
      inputOnFocus: true,
      style: {
        fg: 'black',
        bg: 'white'
      }
    })

    omnibar.on('submit', async () => {
      const value = omnibar.getValue()
      omnibar.clearValue()

      await this.navigate(value)

      this.parent.render()
    })

    this.append(omnibar)

    this.parent.render()

    omnibar.focus()

    this._omnibarAppended = omnibar
  }

  async showWelcome () {
    if (this._welcomeAppended) return

    const welcome = Markdown({
      top: 'center',
      left: 'center',
      width: '50%',
      height: '50%',
      tags: true,
      border: {
        type: 'line'
      }
    })

    welcome.setMarkdown(WELCOME_MESSAGE)

    this.append(welcome)

    this._welcomeAppended = welcome
  }
  hideWelcome () {
    if (!this._welcomeAppended) return

    this._welcomeAppended.detach()

    this._welcomeAppended = null
  }
}
