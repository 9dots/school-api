const getCert = require('../../../getServiceAccount')
const fetch = require('isomorphic-fetch')
const admin = require('firebase-admin')

const cert = getCert()

// exports.firestore = admin.firestore()

exports.default = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Apikey ')
  ) {
    const idToken = req.headers.authorization.split('Apikey ')[1]
    return admin
      .firestore()
      .collection('integrations')
      .where('Apikey', '==', idToken)
      .get()
      .then(snap => {
        return snap.empty
          ? Promise.reject('invalid_api_key')
          : Promise.resolve()
      })
      .then(() => {
        exports.firestore = admin.firestore()
        next()
      })
      .catch(e => {
        console.log(e)
        return res.status(403).send(e)
      })
  }
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    res.status(403).send({ ok: false, error: 'no_authorization_bearer' })
    return
  }
  const idToken = req.headers.authorization.split('Bearer ')[1]
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedIdToken => {
      maybeDeleteApp().then(() => {
        req.uid = decodedIdToken.uid
        const app = admin.initializeApp(
          {
            credential: admin.credential.cert(cert),
            databaseAuthVariableOverride: {
              uid: req.uid
            }
          },
          'user'
        )
        exports.fetch = (url, data) =>
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          }).then(response => {
            response.res = res
            return response
          })
        exports.firestore = app.firestore()
        next()
      })
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
