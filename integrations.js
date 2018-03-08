const path = require('path')
const fetch = require('isomorphic-fetch')
const UrlPattern = require('url-pattern')

const integrations = [
  {
    domain: 'https://pixelbots.io',
    pattern: new UrlPattern('(http(s)\\://)(www.)pixelbots.io(/*)'),
    copyPerStudent: true,
    events: {
      unfurl: link =>
        fetch('http://localhost:5000/api/unfurl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ link })
        }),
      copy: link =>
        fetch('http://localhost:5000/api/copy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ link })
        }).then(res => res.json())
    }
  }
]

// links =>
//   fetch('http://localhost:5000/api/copy', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ links })
//   })
//     .then(res => res.json())
//     .catch(e => console.error('error', e))

module.exports = integrations
