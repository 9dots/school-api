const Schema = require('@weo-edu/schema')
const {
  displayName,
  moduleRefObject,
  firebaseRefObject,
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
module.exports = Schema()
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
