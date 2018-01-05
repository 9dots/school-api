const test = require('tape')
const Ajv = require('ajv')
const { schema } = require('.')

const ajv = new Ajv({ allErrors: true })

const data = {
  displayName: 'student1',
  avatarUrl: 'http://www.student1image.com',
  ethnicity: 'white',
  birthDate: 564739200000,
  gender: 'male',
  assignedLesson: {
    class: 'abc1234',
    module: '432abc21',
    lesson: 'lesson1Id'
  },
  name: {
    given: 'Plickus',
    family: 'Pumpernickle'
  }
}

test('user schema', t => {
  var valid = ajv.validate(schema, data)
  t.equal(valid, true, ajv.errors ? JSON.stringify(ajv.errors) : 'passed')
  t.end()
})
