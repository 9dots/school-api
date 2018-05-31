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
  },
  {
    domain: 'https://docs.google.com/forms/d/',
    pattern: new UrlPattern('(http(s)\\://)docs.google.com/forms/d(/*)'),
    copyPerStudent: true,
    id: 2,
    events: {
      unfurl: createFetch('http://localhost:5000/api/unfurl'),
      copy: createFetch('http://localhost:5000/api/copy')
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
