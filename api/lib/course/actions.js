const integrations = require('../../../integrations')
const arraySet = require('../utils/arraySet')
const uuidv1 = require('uuid/v1')
const Course = require('./model')

exports.incrementAssigns = Course.incrementAssigns
exports.get = Course.get

exports.addLesson = ({ course, ...data }) =>
  Course.addLesson(course, { ...data, id: uuidv1() })
exports.editLesson = ({ course, lesson, ...data }) =>
  Course.updateLesson(course, lesson, l => ({ ...data, ...l }))
exports.removeLesson = ({ course, lesson }) =>
  Course.removeLesson(course, lesson)
exports.create = async (data, user) => {
  const course = await Course.create(data, user)
  return { course: course.id }
}
exports.addTask = async ({ course, lesson, url }) => {
  const int = integrations.find(int => int.pattern.match(url))
  if (int && int.events && int.events.unfurl) {
    const { ok, tasks, error } = await int.events.unfurl(url)
    if (!ok) return Promise.reject(error)
    return updateLesson(tasks)
  }
  return updateLesson([{ url }])

  function updateLesson (tasks) {
    return Course.updateLesson(course, lesson, l => ({
      ...l,
      tasks: (l.tasks || []).concat(
        tasks.map((t, i) => ({ ...t, index: i, id: uuidv1() }))
      )
    }))
  }
}
exports.removeTask = ({ course, lesson, task }) =>
  Course.updateLesson(course, lesson, l => ({
    ...l,
    tasks: (l.tasks || [])
      .filter(t => t.id !== task)
      .map((t, i) => ({ ...t, index: i }))
  }))
exports.updateTask = ({ course, lesson, task, ...data }) =>
  Course.updateLesson(course, lesson, l => ({
    ...l,
    tasks: arraySet(l.tasks, l.tasks.findIndex(t => t.id === task), data)
  }))
