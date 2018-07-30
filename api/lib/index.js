const authenticate = require('./middlewares/authenticate').default
const checkMethod = require('./middlewares/checkMethod')
const getCert = require('../../getServiceAccount')
const validate = require('./middlewares/validate')
const bodyParser = require('body-parser')
const { google } = require('googleapis')
const admin = require('firebase-admin')
const firebase = require('firebase')
const express = require('express')
const cors = require('cors')()
const cert = getCert()

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `${process.env.API_URL}/oauth_response`
)

const app = express()
admin.initializeApp({
  credential: admin.credential.cert(cert),
  databaseURL: process.env.FB_DATABASE_URL
})

firebase.initializeApp({
  apiKey: process.env.API_KEY,
  databaseURL: process.env.FB_DATABASE_URL
})

app.use(bodyParser.json())
app.use(cors)

app.use('/api/:method', authenticate, checkMethod, validate)

app.post('/api/:method', async (req, res) => {
  const { action, body, uid } = req
  try {
    const val = await action(body, uid, req)
    res.send({ ok: true, ...(val || {}) })
  } catch (e) {
    console.error(e)
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

app.post('/googleSignIn', async (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'select_account',
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/forms',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    })
    res.json({ ok: true, url })
  } catch (e) {
    console.error(e)
    res.json({ ok: false })
  }
})

app.get('/oauth_response', async (req, res) => {
  const { code } = req.query
  const { tokens } = await oauth2Client.getToken(code)
  res.redirect(
    `${process.env.CLIENT_URL}/authhandler?token=${tokens.access_token}`
  )
  const cred = firebase.auth.GoogleAuthProvider.credential(tokens.id_token)

  const { user } = await firebase
    .auth()
    .signInAndRetrieveDataWithCredential(cred)
  admin
    .firestore()
    .collection('tokens')
    .doc(user.uid)
    .set(tokens, { merge: true })
})

app.listen(process.env.PORT || 8000)
