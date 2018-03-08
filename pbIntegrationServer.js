const bodyParser = require('body-parser')
const fetch = require('isomorphic-fetch')
const app = require('express')()
const cors = require('cors')()
const url = require('url')

app.use(bodyParser.json())
app.use(cors)

app.post('/api/copy', async (req, res) => {
  const { link } = req.body
  try {
    const instance = await createPixelbotsRequest('createInstance', {
      playlistUrl: url.parse(link).pathname
    })
    return res.send({
      ok: true,
      link: `https://artbot-dev.firebaseapp.com${instance.url}`
    })
  } catch (e) {
    res.send({ ok: false, error: e })
  }
})

app.post('/api/unfurl', (req, res) => {
  const { links } = req.body
  return res.send(links.map(unfurl))
})

function unfurl (link) {
  return link
}

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
  }).then(res => res.json())
}
