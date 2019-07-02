const Blessed = require('blessed')
const yargs = require('yargs')

const {
  Screen
} = Blessed

const DLynx = require('./ui')

module.exports = (args) => {
  yargs
    .scriptName('dlynx')
    .command('$0 [url]', 'Open dlynx and load a URL', noop, run)
    .help()
    .parse(args)
}

function noop () {}

function run (args) {
  // console.error = () => {
  //   // Oh well, we'll figure this out later
  // }

  // Create a screen object.
  const screen = Screen({
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
    ignoreLocked: ['C-c']
  })

  const dlynx = new DLynx()

  dlynx.on('navigated', (url) => {
    screen.title = `dlynx - ${url}`
    screen.render()
  })

  screen.title = 'dlynx'

  screen.append(dlynx)

  screen.key('C-q', () => {
    return process.exit(0)
  })

  screen.key('C-l', () => {
    dlynx.showOmnibar()
  })

  screen.render()

  if (args.url) {
    dlynx.navigate(args.url)
  } else {
    dlynx.showWelcome()
  }
}
