const { getCourseData, getProgressMap } = require('./utils')
const integrations = require('../../../integrations')
const Course = require('../course')
const Module = require('./model')
const User = require('../user')

exports.get = Module.get
exports.create = Module.create
exports.getTaskTeacherView = async ({ task }) => {
  const int = integrations.find(int => int.pattern.match(task.url)) || {}
  if (int && int.teacherView) {
    return { teacherView: int.teacherView(task.uuid) }
  }
  return { teacherView: null }
}
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
exports.setActive = async ({ module, lesson, user, activity }, me) => {
  const batch = Module.fsBatch()
  const thisUser = user || me
  Module.setActive(module, lesson, thisUser, activity.task, { batch })
  batch.update(User.getRef(thisUser), { activeTask: activity })
  return batch.commit()
}
exports.initializeLessonProgress = async data => {
  const { module, lesson, tasks, students } = data
  const batch = Module.fsBatch()
  try {
    await Promise.all(
      Object.keys(students).map(async student => {
        const progress = await Module.getProgress(module, lesson, student)
        if (!progress) {
          Module.setActive(module, lesson, student, tasks[0].id, { batch })
        }
        return Module.updateProgress(
          module,
          lesson,
          student,
          getProgressMap(tasks, (progress || {}).tasks),
          {
            batch
          }
        )
      })
    )
    return batch.commit()
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}
