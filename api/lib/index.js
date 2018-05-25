'use strict'

const authenticate = require('./middlewares/authenticate').default
const checkMethod = require('./middlewares/checkMethod')
const validate = require('./middlewares/validate')
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')()

require('./activity')
require('./class')
require('./course')
require('./module')
require('./school')
require('./user')

const app = express()

app.use(bodyParser.json())
app.use(cors)

app.post('/boop', (req, res) => {
  console.log('boop')
  console.log(req.body)
})

app.use('/api/:method', authenticate, checkMethod, validate)

app.post('/api/:method', async (req, res) => {
  const { action, body, uid } = req
  try {
    const val = await action(body, uid)
    res.send({ ok: true, ...(val || {}) })
  } catch (e) {
    res.send({ ok: false, ...e })
  }
})
app.post('/studentSignIn', async (req, res) => {
  const User = require('./user')
  const { body } = req
  res.set({ connection: 'keep-alive' })
  try {
    const val = await User.signInWithPassword(body)
    res.send({ ok: true, ...(val || {}) })
  } catch (e) {
    res.send({ ok: false, ...e })
  }
})

app.listen(process.env.PORT || 8000)
