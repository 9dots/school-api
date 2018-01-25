'use strict'

const authenticate = require('./middlewares/authenticate')
const checkMethod = require('./middlewares/checkMethod')
const validateData = require('./middlewares/validate')
const bodyParser = require('body-parser')
const app = require('express')()
const cors = require('cors')()

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

app.listen(8000)
