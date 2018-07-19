const integrations = require('../../../integrations')
const mapValues = require('@f/map-values')
const fetch = require('isomorphic-fetch')
const arraySet = require('./arraySet')

module.exports = (activities, tokens) =>
  Promise.all(
    mapValues((data, int) => {
      const url = integrations
        .find(integration => integration.id === Number(int))
        .events.copy()
      return copy(url, tokens.id_token, {
        tasks: data,
        access_token: tokens.access_token
      })
    }, getIntegrations(activities))
  )
    .then(res => res.reduce((acc, tasks) => acc.concat(tasks.instances), []))
    .then(instances => {
      return instances.reduce((acc, act) => {
        const { instance, id } = act || {}
        const activity = acc.find(act => act.id === id)
        const integration = integrations.find(
          int => int.id === activity.instance.int
        )
        return arraySet(acc, acc.indexOf(activity), {
          ...activity,
          teacherView: integration.teacherView
            ? integration.teacherView(activity.uuid)
            : null,
          instance
        })
      }, activities)
    })
    .catch(console.error)

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
    return {}
  }
}

function copy (url, idToken, body) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + idToken
    },
    body: JSON.stringify(body)
  }).then(res => res.json())
}
