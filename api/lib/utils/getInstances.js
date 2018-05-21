const integrations = require('../../../integrations')
const mapValues = require('@f/map-values')
const arraySet = require('./arraySet')

module.exports = activities =>
  Promise.all(
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
