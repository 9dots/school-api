const Schema = require('@weo-edu/schema')
const {
  activityType,
  firebaseRef,
  lessonTags,
  ethnicity,
  grade,
  url
} = require('../utils')

const properties = Schema()
  .prop('studentAge', Schema('number'))
  .prop('studentGradeLevel', grade)
  .prop('teacherAge', Schema('number'))
  .prop('studentEthnicity', ethnicity)
  .prop('teacherEthnicity', ethnicity)
  .prop('activityType', activityType)
  .prop('lessonTags', lessonTags)
  .required([
    'studentAge',
    'studentGradeLevel',
    'teacherAge',
    'studentEthnicity',
    'teacherEthnicity',
    'activityType'
  ])

const subactivity = Schema()
  .prop('url', url)
  .prop('type', activityType)
  .prop('score', Schema('number'))
  .prop('started', Schema('boolean'))
  .prop('completed', Schema('boolean'))
  .prop('progress', Schema('number'))
  .required(['url', 'started', 'completed', 'progress'])

const subactivities = Schema('array').items(subactivity.schema)

// TODO: better name for module instance
module.exports = Schema()
  .prop('student', firebaseRef)
  .prop('module', firebaseRef)
  .prop('teacher', firebaseRef)
  .prop('class', firebaseRef)
  .prop('activity', firebaseRef)
  .prop('moduleInstance', firebaseRef)
  .prop('properties', properties)
  .prop('score', Schema('number'))
  .prop('started', Schema('boolean'))
  .prop('completed', Schema('boolean'))
  .prop('progress', Schema('number'))
  .prop('subactivities', subactivities)
  .prop('url', url)
  .required([
    'student',
    'module',
    'teacher',
    'class',
    'moduleInstance',
    'activity',
    'score',
    'started',
    'completed'
  ])
