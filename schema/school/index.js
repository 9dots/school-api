const Schema = require('@weo-edu/schema')
const { firebaseRefObject, displayName, url } = require('../utils')

const School = Schema()
  .prop('imageUrl', url)
  .prop('displayName', displayName)
  .prop('classes', firebaseRefObject)
  .prop('teachers', firebaseRefObject)
  .prop('students', firebaseRefObject)
  .required(['displayName'])

module.exports = School
