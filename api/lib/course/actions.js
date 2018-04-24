const integrations = require('../../../integrations')
const reorderCourse = require('../utils/reorder')
const arraySet = require('../utils/arraySet')
const uuidv1 = require('uuid/v1')
const Course = require('./model')

exports.incrementAssigns = Course.incrementAssigns
exports.get = Course.get

/**
 * Course
 */
exports.unpublish = async ({ course }) =>
  Course.update(course, { published: false })
exports.create = async (data, user) => {
  const course = await Course.create(data, user)
  return { course: course.id }
}
exports.update = ({ course, ...data }) => {
  if (data.tags || data.grade) {
    return Course.updateTransaction(course, data)
  }
  return Course.update(course, data)
}
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
exports.publish = async ({ course }) => {
  const { lessons = [] } = await Course.get(course)
  if (!lessons.length) {
    return Promise.reject(
      validationError('course', 'Courses must have at least 1 lesson.')
    )
  }
  if (lessons.some(({ tasks = [] }) => !tasks.length)) {
    return Promise.reject(
      validationError('lesson', 'All lessons must have at least 1 task.')
    )
  }
  return Course.update(course, { published: true })
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
  return updateLesson([{ url, displayName: url.substr(0, 25), type: 'link' }])

  function updateLesson (tasks) {
    return Course.updateLesson(course, lesson, l => ({
      ...l,
      tasks: (l.tasks || []).concat(
        tasks.map((t, i) => ({
          ...t,
          displayName: t.displayName.substr(0, 25),
          index: i,
          id: uuidv1()
        }))
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

function validationError (field, message) {
  return {
    error: 'validation_error',
    errorDetails: [{ field, message }]
  }
}
