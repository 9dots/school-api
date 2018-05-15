const integrations = require('../../../integrations')
const arraySet = require('../utils/arraySet')
const mapValues = require('@f/map-values')
const Activity = require('./model')
const omit = require('@f/omit')
const uuid = require('uuid/v1')

const API_URL = 'https://docket-school-api.herokuapp.com'

exports.update = Activity.update
exports.getActivity = getActivity
exports.createBatch = Activity.createBatch
exports.externalUpdate = async ({ id, ...data }) => Activity.update(id, data)
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
    const { instance, student } = await Activity.get(activity)
    const int = integrations.find(int => int.pattern.match(instance))
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
  const activities = await Promise.all(
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

  // Batch requests to integrations
  return Promise.all(
    mapValues((data, int) => {
      const copy = integrations.find(
        integration => integration.id === Number(int)
      ).events.copy
      return copy({ tasks: data })
    }, getIntegrations(activities))
  )
    .then(res => res.reduce((acc, tasks) => acc.concat(tasks.instances), []))
    .then(instances =>
      instances.reduce((acc, { instance, id }) => {
        const activity = acc.find(act => act.id === id)
        return arraySet(acc, acc.indexOf(activity), { ...activity, instance })
      }, activities)
    )
}

async function getActivity (data) {
  const { module, lesson, task, url, student } = data
  try {
    const exists = await Activity.findByModule(student, module, lesson, task)
    if (!exists) {
      const id = uuid()
      const instance = getInstance(url, id)
      return Object.assign({}, data, { instance, id })
    }
  } catch (e) {
    Promise.reject(e)
  }
}

function getIntegrations (activities) {
  try {
    return activities
      .filter(act => act.instance && typeof act.instance.int === 'number')
      .reduce((acc, act) => {
        return {
          ...acc,
          [act.instance.int]: (acc[act.instance.int] || []).concat(
            act.instance.data
          )
        }
      }, {})
  } catch (e) {
    return []
  }
}

function getInstance (url, id) {
  const int = integrations.find(int => int.pattern.match(url))
  return int && int.events && int.events.copy
    ? {
      int: int.id,
      data: {
        taskUrl: url,
        update: {
          host: `${API_URL}/api/activity.externalUpdate`,
          id
        }
      }
    }
    : url
}
