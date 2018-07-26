const integrations = require('../../../integrations')
const Activity = require('./model')
const Module = require('../module')
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
    const batch = Activity.batch()
    const { task, module, lesson, user } = await Activity.get(id)
    batch.update(Activity.getRef(id), data)
    Module.updateProgress(module, lesson, user, { [task]: data }, { batch })
    return batch.commit()
  } catch (e) {
    console.error(id, e)
    Promise.reject('could_not_update')
  }
}
exports.maybeSetCompleted = async ({ activity }, me) => {
  try {
    const batch = Activity.batch()
    const { url, student, module, task, lesson } = await Activity.get(activity)
    const int = integrations.find(int => int.pattern.match(url))
    const data = {
      progress: 100,
      completed: true
    }
    if (!int && student === me) {
      batch.update(Activity.getRef(activity), data)
      Module.updateProgress(module, lesson, me, { [task]: data }, { batch })
      return batch.commit()
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
    console.error(e)
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
