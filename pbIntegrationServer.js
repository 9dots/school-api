const bodyParser = require('body-parser')
const fetch = require('isomorphic-fetch')
const app = require('express')()
const omit = require('@f/omit')
const cors = require('cors')()
const url = require('url')

const origin = 'https://artbot-dev.firebaseapp.com'

app.use(bodyParser.json())
app.use(cors)

app.post('/api/copy', async (req, res) => {
  const { taskUrl, id } = req.body
  try {
    const { instance } = await createPixelbotsRequest('createInstance', {
      taskUrl: url.parse(taskUrl).pathname,
      update: {
        host: 'http://localhost:8000/api/activity.externalUpdate',
        id
      }
    })
    return res.send({ ok: true, instance: url.resolve(origin, instance) })
  } catch (e) {
    return res.send({ ok: false, error: e })
  }
})

app.post('/api/unfurl', async (req, res) => {
  const { taskUrl } = req.body
  const { tasks } = await createPixelbotsRequest('unfurl', {
    taskUrl: url.parse(taskUrl).pathname
  })
  try {
    return res.send({
      ok: true,
      tasks: tasks.map(task =>
        Object.assign({}, task, {
          type: 'assignment',
          url: url.resolve(origin, task.url)
        })
      )
    })
  } catch (e) {
    return res.send({ ok: false, error: e })
  }
})

app.listen(5000, () => {
  console.log('listening on port 5000')
})

function createPixelbotsRequest (endpoint, body) {
  return fetch(`https://artbot-dev.firebaseapp.com/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .then(res => (res.ok ? omit('ok', res) : Promise.reject(res.error)))
}
