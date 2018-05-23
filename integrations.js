const fetch = require('isomorphic-fetch')
const UrlPattern = require('url-pattern')

const integrations = [
  {
    domain: 'https://pixelbots.io',
    pattern: new UrlPattern('(http(s)\\://)(www.)v1.pixelbots.io(/*)'),
    copyPerStudent: true,
    id: 1,
    events: {
      unfurl: createFetch('https://www.pixelbots.io/api/unfurl'),
      copy: createFetch('https://www.pixelbots.io/api/copy')
    }
  }
]

function createFetch (url) {
  return data =>
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => res.json())
}

module.exports = integrations
