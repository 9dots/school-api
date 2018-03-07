const path = require('path')
const fetch = require('isomorphic-fetch')

const integrations = [
  {
    domain: 'https://pixelbots.io',
    events: {
      unfurl: 'localhost:5000/api/unfurl',
      copy: 'localhost:5000/api/copy'
    }
  }
]

module.exports = integrations
