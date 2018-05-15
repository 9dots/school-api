const fetch = require('isomorphic-fetch')
const UrlPattern = require('url-pattern')

const integrations = [
  {
    domain: 'https://pixelbots.io',
    pattern: new UrlPattern('(http(s)\\://)(www.)v1.pixelbots.io(/*)'),
    copyPerStudent: true,
    id: 1,
    events: {
      unfurl: taskUrl =>
        fetch('https://www.pixelbots.io/api/unfurl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ taskUrl })
        }).then(res => res.json()),
      copy: data =>
        fetch('https://www.pixelbots.io/api/copy', {
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
