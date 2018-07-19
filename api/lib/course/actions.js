const integrations = require('../../../integrations')
const reorderCourse = require('../utils/reorder')
const arraySet = require('../utils/arraySet')
const fetch = require('isomorphic-fetch')
const uuidv1 = require('uuid/v1')
const Course = require('./model')
const Auth = require('../auth')

exports.get = Course.get
exports.incrementAssigns = Course.incrementAssigns

/**
 * Course
 */
exports.unpublish = async ({ course }) =>
  Course.update(course, { published: false })
exports.create = async (data, user) => {
  const course = await Course.create(data, user)
  const { draft } = await Course.createDraft(course.id)
  return { course: course.id, draft }
}
exports.update = ({ course, draft, ...data }) => {
  if (data.tags || data.grade) {
    return Course.updateTransaction(course, data, draft)
  }
  return Course.update(course, draft, data)
}
exports.reorder = async ({ course, draft, source, type, destination, id }) => {
  try {
    const { lessons } = await Course.getDraft(course, draft)
    return Course.updateDraft(course, draft, {
      lessons: reorderCourse(lessons, source, type, destination, id)
    })
  } catch (e) {
    return Promise.reject({ error: e })
  }
}
exports.publish = async ({ course, draft }) => {
  const Module = require('../module')
  const draftData = await Course.getDraft(course, draft)
  const { lessons = [] } = draftData
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
  try {
    Module.updateCourse({ course, courseData: draftData })
    return Course.updateTransaction(course, { ...draftData, published: true })
  } catch (e) {
    return Promise.reject({ error: e.message })
  }
}
exports.createDraft = async ({ course }) => {
  try {
    return Course.createDraft(course)
  } catch (e) {
    console.error(e)
    return Promise.reject({ error: e.message })
  }
}

/**
 * Lessons
 */
exports.addLesson = ({ course, draft, ...data }) =>
  Course.addLesson(course, draft, { ...data, id: uuidv1() })
exports.updateLesson = ({ course, draft, lesson, ...data }) =>
  Course.updateLesson(course, draft, lesson, l => ({ ...l, ...data }))
exports.removeLesson = ({ course, draft, lesson }) =>
  Course.removeLesson(course, draft, lesson)

/**
 * Task
 */
exports.addTask = async ({ course, draft, lesson, url }, user, req) => {
  const int = integrations.find(int => int.pattern.match(url))
  const {
    tokens: { access_token, id_token }
  } = await Auth.getAccessToken(null, user)
  if (int && int.events && int.events.unfurl) {
    const { ok, tasks, error, errorDetails } = await fetch(
      int.events.unfurl(),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + id_token
        },
        body: JSON.stringify({
          taskUrl: url,
          access_token
        })
      }
    ).then(res => res.json())
    if (!ok) return Promise.reject({ error, errorDetails })
    return updateLesson(tasks)
  }
  return updateLesson([{ url, type: 'practice' }])

  function updateLesson (tasks) {
    return Course.updateLesson(course, draft, lesson, l => ({
      ...l,
      tasks: (l.tasks || []).concat(
        tasks.map((t, i) => {
          const update = {
            ...t,
            index: (l.tasks || []).length + i,
            id: uuidv1()
          }
          if (t.displayName) {
            update.displayName = t.displayName.substr(0, 25)
          }
          return update
        })
      )
    }))
  }
}
exports.removeTask = ({ course, draft, lesson, task }) =>
  Course.updateLesson(course, draft, lesson, l => ({
    ...l,
    tasks: (l.tasks || [])
      .filter(t => t.id !== task)
      .map((t, i) => ({ ...t, index: i }))
  }))
exports.updateTask = ({ course, lesson, draft, task, ...data }) =>
  Course.updateLesson(course, draft, lesson, l => {
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
