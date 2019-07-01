const TurndownService = require('turndown')
const turndownService = new TurndownService()

turndownService.remove('script')
turndownService.remove('style')
turndownService.remove('img')

module.exports = async function convertToMD (response) {
  // Conver a response to a markdown node

  const contentType = response.headers.get('content-type')

  const text = await response.text()

  let toRender = text
  if (contentType.includes('html')) {
    try {
      toRender = turndownService.turndown(text)
    } catch (e) {
    // Oh well
    }
  } else if (contentType.includes('json')) {
    try {
      const parsed = JSON.parse(text)
      const stringified = JSON.stringify(parsed, null, '  ')
      toRender = '```json\n' + stringified + '\n```'
    } catch (e) {
      // Oh well
    }
  }

  return toRender
}
