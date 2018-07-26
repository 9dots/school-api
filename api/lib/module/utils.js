const uuid = require('uuid/v1')
const omit = require('@f/omit')

function getCourseData (mod, course, cls) {
  return {
    ...omit('id', mod),
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

function getProgressMap (tasks, progress = {}) {
  return tasks.reduce(
    (acc, task) => ({
      ...acc,
      [task.id]: progress[task.id] || {
        progress: 0,
        completed: false,
        started: false
      }
    }),
    {}
  )
}

exports.getCourseData = getCourseData
exports.addTaskIds = addTaskIds
exports.getProgressMap = getProgressMap
