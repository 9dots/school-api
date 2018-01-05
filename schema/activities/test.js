const test = require('tape')
const Ajv = require('ajv')
const { schema } = require('.')

const ajv = new Ajv({ allErrors: true })

const data = {
  student: 'abc1234',
  module: 'abc1234t',
  moduleInstance: 'baldfgja',
  teacher: 'abc1234vgf',
  class: 'abc1234asf',
  activity: 'abc1234asev',
  score: 5,
  started: true,
  completed: false,
  progress: 74,
  properties: {
    studentAge: 14,
    studentGradeLevel: '4',
    teacherAge: 32,
    studentEthnicity: 'hispanic',
    teacherEthnicity: 'white',
    activityType: 'write',
    lessonTags: { coding: true }
  },
  subactivities: [
    {
      url: 'http://www.subactivity1.com',
      type: 'write',
      score: 5,
      started: true,
      completed: false,
      progress: 75
    }
  ]
}

test('activities schema', t => {
  var valid = ajv.validate(schema, data)
  t.equal(valid, true, ajv.errors ? JSON.stringify(ajv.errors) : 'passed')
  t.end()
})
