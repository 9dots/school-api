const Schema = require('@weo-edu/schema')

const url = Schema('string').pattern(
  /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/,
  'not_valid_url'
)

const firebaseRefObject = Schema()
  .prop(/^.*$/, { type: 'boolean' })
  .others(false, 'invalid_keys')

const firebaseRef = Schema('string').min(1, 'invalid_firebase_ref')

const moduleObject = Schema()
  .prop('moduleRef', firebaseRef)
  // .prop('active', Schema('boolean'))
  .required(['moduleRef'])

const moduleRefObject = Schema()
  .prop(/^.*$/, moduleObject)
  .others(false, 'invalid_keys')

const displayName = Schema('string')
  .min(1, 'displayName_too_short')
  .max(25, 'displayName_too_long')

const description = Schema('string')
  .min(1)
  .max(200)

const activityType = Schema('string').enum([
  'listen',
  'write',
  'watch',
  'assignment',
  'test'
])

const ethnicity = Schema('string').enum([
  'white',
  'black',
  'hispanic',
  'asian',
  'pacific islander'
])

const date = Schema('number')
const lesson = Schema('string').min(0)
const uuid = Schema('string').min(10)
const grade = Schema('string').enum([
  'k',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12'
])

module.exports = {
  lessonTags: firebaseRefObject,
  firebaseRefObject,
  moduleRefObject,
  activityType,
  firebaseRef,
  displayName,
  description,
  ethnicity,
  lesson,
  grade,
  uuid,
  date,
  url
}
