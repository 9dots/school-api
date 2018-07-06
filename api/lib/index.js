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
  '1043095705337-3u723nkn2ssl2t7kid7ck8599anp1b6h.apps.googleusercontent.com',
  'wFZ51rJu10Gi_Vrzh-DqatJO',
  'http://localhost:8000/oauth_response'
)

const app = express()
admin.initializeApp({
  credential: admin.credential.cert(cert),
  databaseURL: 'https://school-dev-28e75.firebaseio.com'
})

firebase.initializeApp({
  apiKey: 'AIzaSyDrp1yspbjLecs1Zy46G28hV8gwWYgMAhs',
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

app.post('/googleSignIn', async (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
      prompt: 'select_account',
      // If you only need one scope you can pass it as a string
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/forms',
        'https://www.googleapis.com/auth/plus.me'
      ]
    })
    // await admin
    //   .database()
    //   .ref(`tokens/${user}`)
    //   .set(tokens)
    res.json({ ok: true, url })
  } catch (e) {
    res.json({ ok: false })
  }
})

app.get('/oauth_response', async (req, res) => {
  const { code } = req.query
  const { tokens } = await oauth2Client.getToken(code)
  res.redirect(`http://localhost:3000/authhandler?token=${tokens.access_token}`)
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
