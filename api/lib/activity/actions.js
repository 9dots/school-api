const integrations = require('../../../integrations')
const Activity = require('./model')

exports.update = Activity.update
exports.add = async data => {
  const { module, lesson, task, url, student } = data
  try {
    const exists = await Activity.findByModule(student, module, lesson, task)
    if (!exists) {
      const instance = await getInstance(url)
      console.log(instance)
      return Activity.add(Object.assign({}, data, { instance }))
    }
  } catch (e) {
    Promise.reject(e)
  }
}
exports.setActive = async ({ activity, lesson }, user) => {
  const active = await Activity.findActive(user, lesson)
  await Promise.all(
    active.map(active => Activity.update(active, { active: false }))
  )
  return Activity.update(activity, { active: true, started: true })
}

function getInstance (url) {
  const int = integrations.find(int => int.pattern.match(url))
  return int && int.events && int.events.copy
    ? int.events
      .copy(url)
      .then(res => res.instance)
      .catch(e => console.log(e))
    : url
}
