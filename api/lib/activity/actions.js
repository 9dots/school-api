const integrations = require('../../../integrations')
const Activity = require('./model')
const uuid = require('uuid/v1')

exports.update = Activity.update
exports.add = async data => {
  const { module, lesson, task, url, student } = data
  try {
    const exists = await Activity.findByModule(student, module, lesson, task)
    if (!exists) {
      const id = uuid()
      const instance = await getInstance(url, id)
      return Activity.add(id, Object.assign({}, data, { instance, id }))
    }
  } catch (e) {
    Promise.reject(e)
  }
}
exports.externalUpdate = async ({ id, ...data }) => {
  console.log('update external', id, data)
  return Activity.update(id, data)
}
exports.setActive = async ({ activity, lesson }, user) => {
  const active = await Activity.findActive(user, lesson)
  await Promise.all(
    active.map(active => Activity.update(active, { active: false }))
  )
  return Activity.update(activity, { active: true, started: true })
}

function getInstance (url, id) {
  const int = integrations.find(int => int.pattern.match(url))
  return int && int.events && int.events.copy
    ? int.events
      .copy({ taskUrl: url, id })
      .then(res => res.instance)
      .catch(e => console.log(e))
    : url
}
