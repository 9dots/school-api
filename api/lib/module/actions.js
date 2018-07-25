const { getCourseData, getProgressMap } = require('./utils')
const Course = require('../course')
const Module = require('./model')

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

// Progress

exports.updateProgress = Module.updateProgress
exports.getProgressRef = Module.getProgressRef
exports.initializeLessonProgress = async data => {
  const { module, lesson, tasks, students } = data
  const batch = Module.fsBatch()
  await Promise.all(
    Object.keys(students).map(async student => {
      const progress = (await Module.getProgress(module, lesson, student)) || {}
      return Module.setProgress(
        module,
        lesson,
        student,
        getProgressMap(tasks, progress),
        {
          batch
        }
      )
    })
  )
  return batch.commit()
}
