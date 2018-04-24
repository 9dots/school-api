const fetch = require('isomorphic-fetch')
const UrlPattern = require('url-pattern')

const integrations = [
  {
    domain: 'https://pixelbots.io',
    pattern: new UrlPattern('(http(s)\\://)(www.)v1.pixelbots.io(/*)'),
    copyPerStudent: true,
    events: {
      unfurl: taskUrl =>
        fetch('https://pb-integration-server.herokuapp.com/api/unfurl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskUrl })
        }).then(res => res.json()),
      copy: data =>
        fetch('https://pb-integration-server.herokuapp.com/api/copy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }).then(res => res.json())
    }
  }
]

module.exports = integrations
