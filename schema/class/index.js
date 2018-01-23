const Schema = require('@weo-edu/schema')
const validate = require('@weo-edu/validate')
const {
  firebaseRefObject,
  moduleRefObject,
  displayName,
  firebaseRef,
  grade,
  uuid
} = require('../utils')

const totalStat = Schema()
  .prop('score', Schema('number'))
  .prop('started', Schema('number'))
  .prop('completed', Schema('number'))
  .prop('progress', Schema('number'))

const stats = Schema()
  .prop('activityId', firebaseRef)
  .prop('moduleInstance', uuid)
  .prop('totals', totalStat)
  .required(['activityId', 'moduleInstance'])

const statsObject = Schema()
  .prop(/^.*$/, stats)
  .others(false)

// XXX: Stats is a subcollection. Not sure how to document this yet.
const Class = Schema()
  .prop('displayName', displayName)
  .prop('grade', grade)
  .prop('school', firebaseRef)
  .prop('owner', firebaseRef)
  .prop('modules', moduleRefObject)
  .prop('teachers', firebaseRefObject)
  .prop('students', firebaseRefObject)
  .prop('stats', statsObject)
  .others(false)
  .required(['displayName', 'grade', 'school', 'owner'])

const createClass = Schema()
  .prop('displayName', displayName)
  .prop('grade', grade)
  .prop('school', firebaseRef)
  .prop('uid', firebaseRef)
  .others(false, 'invalid_fields')
  .required(['displayName', 'grade', 'school', 'uid'], 'missing_required_field')

const addStudents = Schema()
  .prop('class', firebaseRef)
  .prop('school', firebaseRef)
  .prop('uid', firebaseRef)
  .prop('students', Schema('array').items(firebaseRef.schema))
  .others(false, 'invalid_fields')
  .required(['class', 'school', 'students', 'uid'], 'missing_required_field')

const removeStudents = Schema()
  .prop('class', firebaseRef)
  .prop('uid', firebaseRef)
  .prop('students', Schema('array').items(firebaseRef.schema))
  .others(false, 'invalid_fields')
  .required(['class', 'students', 'uid'], 'missing_required_field')

exports.default = Class
exports.createClass = validate(createClass)
exports.addStudents = validate(addStudents)
exports.removeStudents = validate(removeStudents)
