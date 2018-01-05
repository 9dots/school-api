const test = require('tape')
const Ajv = require('ajv')
const { schema } = require('.')

const ajv = new Ajv({ allErrors: true })

const data = {
  displayName: 'module1',
  description: 'This is the first module.',
  imageUrl: 'http://www.image1Url.com',
  owner: 'user12345',
  lessons: {
    lessonId: {
      displayName: 'module1-lesson1',
      description: 'first lesson for module 1',
      index: 0,
      activities: {
        activityId: {
          displayName: 'activity1',
          url: 'http://www.activty1.com',
          index: 0,
          type: 'write'
        }
      },
      tags: { coding: true }
    }
  },
  published: true,
  assigns: 4
}

test('module schema', t => {
  var valid = ajv.validate(schema, data)
  t.equal(valid, true, ajv.errors ? JSON.stringify(ajv.errors) : 'passed')
  t.end()
})
