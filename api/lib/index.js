'use strict'

const authenticate = require('./middlewares/authenticate').default
const checkMethod = require('./middlewares/checkMethod')
const validate = require('./middlewares/validate')
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')()

const app = express()

app.use(bodyParser.json())
app.use(cors)
app.use(authenticate)
app.use('/api/:method', checkMethod, validate)
app.post('/api/:method', async (req, res) => {
  const { action, body, uid } = req
  try {
    const val = await action(body, uid)
    res.send({ ok: true, ...(val || {}) })
  } catch (e) {
    res.send({ ok: false, ...e })
  }
})

app.listen(process.env.PORT || 8000)
