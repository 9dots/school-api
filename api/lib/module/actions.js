const Module = require('./model')
const Course = require('../course')

exports.create = Module.create
exports.get = Module.get
exports.createCopy = async ({ course, class: cls }) => {
  try {
    await Course.incrementAssigns(course)
    const mod = await Course.get(course)
    const ref = await Module.create(getCourseData(mod, course, cls))
    return { module: ref.id }
  } catch (e) {
    return Promise.reject(e)
  }
}

function getCourseData (mod, course, cls) {
  return {
    ...mod,
    class: cls,
    course: {
      ref: course,
      version: mod.version || 0
    }
  }
}
