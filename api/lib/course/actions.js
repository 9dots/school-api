const Course = require('./model')
const Module = require('../module')

exports.create = Course.create
exports.get = Course.get
exports.createCopy = async ({ module: mod, class: cls }) => {
  try {
    await Module.incrementAssigns(mod)
    const course = await Module.get(mod)
    const ref = await Course.create(getCourseData(course, mod, cls))
    return { course: ref.id }
  } catch (e) {
    return Promise.reject(e)
  }
}

function getCourseData (course, mod, cls) {
  return {
    ...course,
    class: cls,
    module: {
      ref: mod,
      version: course.version || 0
    }
  }
}
