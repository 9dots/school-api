const Course = require('../course')
const Module = require('./model')
const uuid = require('uuid/v1')

exports.get = Module.get
exports.create = Module.create
exports.updateCourse = async ({ course, courseData }) => {
  try {
    const modules = await Module.getByCourse(course)
    const batch = modules.reduce((b, { id, class: cls }) => {
      return b.set(Module.getRef(id), getCourseData(courseData, course, cls))
    }, Module.fsBatch())
    return batch.commit()
  } catch (e) {
    return Promise.reject(e)
  }
}
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
    lessons: addTaskIds(mod),
    course: {
      ref: course,
      version: mod.version || 0
    }
  }
}

function addTaskIds (course) {
  return course.lessons.map(l => ({
    ...l,
    tasks: l.tasks.map(t => ({ ...t, uuid: uuid() }))
  }))
}
