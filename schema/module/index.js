const Schema = require('@weo-edu/schema')
const {
  displayName,
  description,
  firebaseRef,
  activityType,
  lessonTags,
  url
} = require('../utils')

// add description

const activity = Schema()
  .prop('displayName', displayName)
  .prop('url', url)
  .prop('type', activityType)
  .prop('index', Schema('number'))
  .required(['displayName', 'url', 'type', 'index'])
const activities = Schema()
  .prop(/^.*$/, activity)
  .others(false)

const lesson = Schema()
  .prop('displayName', displayName)
  .prop('description', description)
  .prop('activities', activities)
  .prop('index', Schema('number'))
  .prop('tags', lessonTags)
  .required(['displayName', 'description', 'index'])
const lessons = Schema()
  .prop(/^.*$/, lesson)
  .others(false)

module.exports = Schema()
  .prop('displayName', displayName)
  .prop('description', description)
  .prop('imageUrl', url)
  .prop('owner', firebaseRef)
  .prop('lessons', lessons)
  .prop('published', Schema('boolean'))
  .prop('featured', Schema('boolean'))
  .prop('assigns', Schema('number'))
  .required(['displayName', 'description', 'owner', 'imageUrl'])
