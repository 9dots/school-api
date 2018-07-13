const fetch = require('isomorphic-fetch')
const UrlPattern = require('url-pattern')

const integrations = [
  {
    domain: 'https://pixelbots.io',
    pattern: new UrlPattern('(http(s)\\://)(www.)v1.pixelbots.io(/*)'),
    copyPerStudent: true,
    id: 1,
    events: {
      unfurl: createPost('https://www.pixelbots.io/api/unfurl'),
      copy: createPost('https://www.pixelbots.io/api/copy')
    }
  },
  {
    domain: 'https://docs.google.com/forms/d/',
    pattern: new UrlPattern('(http(s)\\://)docs.google.com/forms/d(/*)'),
    classCopy: true,
    copyPerStudent: true,
    teacherView: taskUrl =>
      `https://google-form-integration-stagin.herokuapp.com/teacher/${taskUrl}`,
    id: 2,
    events: {
      unfurl: createPost(
        'https://google-form-integration-stagin.herokuapp.com/api/unfurl'
      ),
      copy: createPost(
        'https://google-form-integration-stagin.herokuapp.com/api/copy'
      )
    }
  }
]

function createPost (url) {
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
