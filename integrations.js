const fetch = require('isomorphic-fetch')
const UrlPattern = require('url-pattern')

const integrations = [
  {
    domain: 'https://pixelbots.io',
    pattern: new UrlPattern('(http(s)\\://)(www.)v1.pixelbots.io(/*)'),
    copyPerStudent: true,
    id: 1,
    events: {
      unfurl (data) {
        return createPost(
          'https://www.pixelbots.io/api/unfurl',
          data,
          this.errors
        )
      },
      copy (data) {
        return createPost(
          'https://www.pixelbots.io/api/copy',
          data,
          this.errors
        )
      },
      errors: {}
    }
  },
  {
    domain: 'https://docs.google.com/forms/d/',
    pattern: new UrlPattern(/https?:\/\/(?:goo.gl|docs.google.com)\/forms/),
    classCopy: true,
    copyPerStudent: true,
    teacherView: taskUrl =>
      `https://google-form-integration.herokuapp.com/teacher/${taskUrl}`,
    id: 2,
    events: {
      unfurl (data) {
        return createPost(
          'https://google-form-integration.herokuapp.com/api/unfurl',
          data,
          this.errors
        )
      },
      copy (data) {
        return createPost(
          'https://google-form-integration.herokuapp.com/api/copy',
          data,
          this.errors
        )
      },
      errors: {
        invalid_form: [
          {
            field: 'url',
            message:
              'Google Form url is invalid. Please make sure to use the edit link from the browser.'
          }
        ]
      }
    }
  }
]

function createPost (url, data, errors) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(res => {
      return res.ok
        ? res
        : { ok: false, error: res.error, errorDetails: errors[res.error] }
    })
}

module.exports = integrations
