const integrations = require('../../../integrations')
const arraySet = require('../utils/arraySet')
const reorderCourse = require('../utils/reorder')
const uuidv1 = require('uuid/v1')
const Course = require('./model')

exports.incrementAssigns = Course.incrementAssigns
exports.get = Course.get

/**
 * Course
 */
exports.create = async (data, user) => {
  const course = await Course.create(data, user)
  return { course: course.id }
}
exports.update = ({ course, ...data }) => Course.update(course, data)
exports.reorder = async ({ course, source, type, destination, id }) => {
  try {
    const { lessons } = await Course.get(course)
    return Course.update(course, {
      lessons: reorderCourse(lessons, source, type, destination, id)
    })
  } catch (e) {
    return Promise.reject(e)
  }
}

/**
 * Lesson
 */
exports.addLesson = ({ course, ...data }) =>
  Course.addLesson(course, { ...data, id: uuidv1() })
exports.updateLesson = ({ course, lesson, ...data }) =>
  Course.updateLesson(course, lesson, l => ({ ...l, ...data }))
exports.removeLesson = ({ course, lesson }) =>
  Course.removeLesson(course, lesson)

/**
 * Task
 */
exports.addTask = async ({ course, lesson, url, index }) => {
  const int = integrations.find(int => int.pattern.match(url))
  if (int && int.events && int.events.unfurl) {
    const { ok, tasks, error } = await int.events.unfurl(url)
    if (!ok) return Promise.reject(error)
    return updateLesson(tasks)
  }
  return updateLesson([{ url, displayName: url, type: 'link' }])

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
  Course.updateLesson(course, lesson, l => {
    const tsk = l.tasks.find(t => t.id === task)
    return {
      ...l,
      tasks: arraySet(l.tasks, l.tasks.indexOf(tsk), { ...tsk, ...data })
    }
  })
