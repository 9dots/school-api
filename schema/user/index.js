const Schema = require('@weo-edu/schema')
const {
  firebaseRef,
  displayName,
  ethnicity,
  moduleId,
  lesson,
  date,
  url
} = require('../utils')

const assignedLesson = Schema()
  .prop('class', firebaseRef)
  .prop('module', moduleId)
  .prop('lesson', lesson)

const name = Schema()
  .prop('given', displayName)
  .prop('family', displayName)
  .required(['given', 'family'])

const gender = Schema('string').enum(['male', 'female', 'other'])

module.exports = Schema()
  .prop('displayName', displayName)
  .prop('avatarUrl', url)
  .prop('name', name)
  .prop('birthDate', date)
  .prop('ethnicity', ethnicity)
  .prop('gender', gender)
  .prop('assignedLesson', assignedLesson)
  .prop('teacherClasses', Schema('boolean'))
  .required([
    'displayName',
    'avatarUrl',
    'name',
    'birthDate',
    'ethnicity',
    'gender'
  ])
