const defaultFetch = require('make-fetch-happen').defaults()
const DatArchive = require('node-dat-archive')
const datFetch = require('dat-fetch')(DatArchive, defaultFetch)

const fetch = require('proto-fetch')({
  https: defaultFetch,
  http: defaultFetch,
  dat: datFetch
})

module.exports = fetch
