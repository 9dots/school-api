const Activity = require('./model')

exports.add = Activity.add
exports.update = Activity.update
exports.setActive = async ({ activity, lesson }, user) => {
  const active = await Activity.findActive(user, lesson)
  await Promise.all(
    active.map(active => Activity.update(active, { active: false }))
  )
  return Activity.update(activity, { active: true })
}
