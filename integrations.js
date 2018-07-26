const UrlPattern = require('url-pattern')

const integrations = [
  {
    domain: 'https://pixelbots.io',
    pattern: new UrlPattern('(http(s)\\://)(www.)v1.pixelbots.io(/*)'),
    copyPerStudent: true,
    id: 1,
    events: {
      unfurl: () => 'https://www.pixelbots.io/api/unfurl',
      copy: () => 'https://www.pixelbots.io/api/copy'
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
      unfurl: () => 'https://google-form-integration.herokuapp.com/api/unfurl',
      copy: () => 'https://google-form-integration.herokuapp.com/api/copy'
    }
  }
]

module.exports = integrations
