const admin = require('firebase-admin')
const fetch = require('isomorphic-fetch')

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
      req.uid = decodedIdToken.uid
      next()
    })
    .catch(error => {
      return res.status(403).send({ ok: false, error: error.message })
    })
}
