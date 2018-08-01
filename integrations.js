const UrlPattern = require('url-pattern')

const integrations = [
  {
    domain: 'https://pixelbots.io',
    pattern: new UrlPattern('(http(s)\\://)(www.)v1.pixelbots.io(/*)'),
    copyPerStudent: true,
    id: 1,
    events: {
      warmup: () => 'https://www.pixelbots.io/api/keepAlive',
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
      `https://forms-dot-school-5927d.appspot.com/teacher/${taskUrl}`,
    id: 2,
    events: {
      warmup: () => 'https://forms-dot-school-5927d.appspot.com/_ah/warmup',
      unfurl: () => 'https://forms-dot-school-5927d.appspot.com/api/unfurl',
      copy: () => 'https://forms-dot-school-5927d.appspot.com/api/copy'
    }
  }
]

module.exports = integrations
