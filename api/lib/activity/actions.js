const Activity = require('./model')

exports.add = async data => {
  const { module, lesson, task } = data
  try {
    const exists = await Activity.findByModule(module, lesson, task)
    if (!exists) {
      return Activity.add(data)
    }
  } catch (e) {
    Promise.reject(e)
  }
}
exports.update = Activity.update
exports.setActive = async ({ activity, lesson }, user) => {
  const active = await Activity.findActive(user, lesson)
  await Promise.all(
    active.map(active => Activity.update(active, { active: false }))
  )
  return Activity.update(activity, { active: true })
}
