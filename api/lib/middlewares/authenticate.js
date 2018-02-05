const admin = require('firebase-admin')
// const serviceAccount = require('../../../secret.json')

const cert = {
  projectId: process.env.PROJECT_ID,
  clientEmail: process.env.CLIENT_EMAIL,
  privateKey: process.env.SECRET_KEY.replace(/\\n/g, '\n')
}

// console.log(cert, process.env.SECRET_KEY)

const adminApp = admin.initializeApp({
  credential: admin.credential.cert(cert)
})

module.exports = (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    res.status(403).send({ ok: false, error: 'no_authorization_bearer' })
    return
  }
  const idToken = req.headers.authorization.split('Bearer ')[1]
  maybeDeleteApp()
    .then(() => adminApp.auth().verifyIdToken(idToken))
    .then(decodedIdToken => {
      req.uid = decodedIdToken.uid
      req.firestore = admin
        .initializeApp(
          {
            credential: admin.credential.cert(cert),
            databaseAuthVariableOverride: {
              uid: req.uid
            }
          },
          'user'
        )
        .firestore()
      next()
    })
    .catch(error => {
      return res.status(403).send({ ok: false, error: error.message })
    })
}

function maybeDeleteApp () {
  return admin.apps.findIndex(app => app.name === 'user') > -1
    ? admin.app('user').delete()
    : Promise.resolve()
}
