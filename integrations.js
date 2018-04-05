const fetch = require('isomorphic-fetch')
const UrlPattern = require('url-pattern')

const integrations = [
  {
    domain: 'https://pixelbots.io',
    pattern: new UrlPattern(
      '(http(s)\\://)(www.)artbot-dev.firebaseapp.com(/*)'
    ),
    copyPerStudent: true,
    events: {
      unfurl: taskUrl =>
        fetch('http://localhost:5000/api/unfurl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskUrl })
        }).then(res => res.json()),
      copy: taskUrl =>
        fetch('http://localhost:5000/api/copy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ taskUrl })
        }).then(res => res.json())
    }
  }
]

module.exports = integrations
