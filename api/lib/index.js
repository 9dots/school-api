'use strict'

const authenticate = require('./middlewares/authenticate')
const checkMethod = require('./middlewares/checkMethod')
const validateData = require('./middlewares/validate')
const bodyParser = require('body-parser')
const app = require('express')()
const cors = require('cors')()
const map = require('@f/map')

const schoolMethods = require('./school')
const classMethods = require('./class')
const userMethods = require('./user')

app.use(cors)
app.use(bodyParser.json())

app.post(
  '/api/:method',
  authenticate,
  checkMethod,
  validateData,
  (req, res) => {
    return req
      .method(req.firestore, req.uid, req.body)
      .then((val = {}) => res.send({ ok: true, ...val }))
      .catch(e => res.send({ ok: false, error: e.message, errorDetails: e }))
  }
)

app.get('/api/list', (req, res) => {
  res.send({
    school: map(fn => true, schoolMethods),
    class: classMethods,
    user: map(fn => true, userMethods)
  })
})

app.listen(8000)
