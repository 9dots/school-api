const authenticate = require('./middlewares/authenticate').default
const checkMethod = require('./middlewares/checkMethod')
const getCert = require('../../getServiceAccount')
const validate = require('./middlewares/validate')
const bodyParser = require('body-parser')
const admin = require('firebase-admin')
const express = require('express')
const cors = require('cors')()
const cert = getCert()

const app = express()
admin.initializeApp({
  credential: admin.credential.cert(cert),
  databaseURL: 'https://school-dev-28e75.firebaseio.com'
})

app.use(bodyParser.json())
app.use(cors)

app.use('/api/:method', authenticate, checkMethod, validate)

app.post('/api/:method', async (req, res) => {
  const { action, body, uid } = req
  try {
    const val = await action(body, uid, res)
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

// app.post('/oauth', async (req, res) => {
//   const { code, user } = req.body
//   try {
//     const { tokens } = await oauth2Client.getToken(code)
//     console.log(tokens)
//     await admin
//       .database()
//       .ref(`tokens/${user}`)
//       .set(tokens)
//     res.json({ ok: true })
//   } catch (e) {
//     res.json({ ok: false })
//   }
// })

app.listen(process.env.PORT || 8000)
