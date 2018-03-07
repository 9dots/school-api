const bodyParser = require('body-parser')
const app = require('express')()
const cors = require('cors')()

app.use(bodyParser.json())
app.use(cors)

app.post('/api/copy', (req, res) => {
  const { links } = req.body
  console.log(links)
  return res.send(links.map(copy))
})

app.post('/api/unfurl', (req, res) => {
  const { links } = req.body
  return res.send(links.map(unfurl))
})

function copy (link) {
  return link
}

function unfurl (link) {
  return link
}

app.listen(5000, () => {
  console.log('listening on port 5000')
})
