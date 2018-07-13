const integrations = require('../../../integrations')
const Activity = require('./model')
const omit = require('@f/omit')
const uuidv1 = require('uuid/v1')

const API_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.HEROKU_URL
    : 'http://localhost:8000'

exports.update = Activity.update
exports.getActivity = getActivity
exports.createBatch = Activity.createBatch
exports.externalUpdate = async ({ id, ...data }) => {
  try {
    await Activity.update(id, data)
    return
  } catch (e) {
    Promise.reject('could_not_update')
  }
}
exports.setActive = async ({ activity, lesson }, user) => {
  const active = await Activity.findActive(user, lesson)
  const batch = Activity.batch()
  active.forEach(active =>
    batch.update(Activity.getRef(active), { active: false })
  )
  batch.update(Activity.getRef(activity), { active: true, started: true })
  return batch.commit()
}
exports.maybeSetCompleted = async ({ activity }, me) => {
  try {
    const { url, student } = await Activity.get(activity)
    const int = integrations.find(int => int.pattern.match(url))
    if (!int && student === me) {
      await Activity.update(activity, { progress: 100, completed: true })
      return
    }
  } catch (e) {
    return Promise.reject(e)
  }
}
exports.getActivities = async data => {
  const { lesson, user } = data
  const { tasks = [], id } = lesson

  // Create list of activities
  return Promise.all(
    tasks.map((task, i) =>
      getActivity(
        Object.assign({}, omit(['id', 'instance', 'user'], task), {
          ...omit(['id'], data),
          active: i === 0,
          task: task.id,
          student: user,
          lesson: id
        })
      )
    )
  ).then(activities => activities.filter(act => !!act))
}

async function getActivity (data) {
  const { module, task, url, uuid, student } = data
  const int = integrations.find(int => int.pattern.match(url)) || {}
  try {
    const exists = await Activity.findByModule(student, module, task)
    if (!exists) {
      const id = uuidv1()
      const instance = getInstance(url, id, uuid, int)
      return Object.assign({}, data, {
        instance,
        id,
        integration: int.id || null
      })
    }
  } catch (e) {
    Promise.reject(e)
  }
}

function getInstance (url, id, task, int) {
  return int && int.events && int.events.copy
    ? {
      int: int.id,
      data: {
        taskUrl: url,
        task,
        update: {
          host: `${API_URL}/api/activity.externalUpdate`,
          id
        }
      }
    }
    : url
}
