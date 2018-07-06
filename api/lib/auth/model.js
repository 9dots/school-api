const { firestore } = require('../middlewares/authenticate')
const omit = require('@f/omit')

const authRef = firestore.collection('tokens')

exports.getToken = id => {
  return authRef
    .doc(id)
    .get()
    .then(snap => snap.data())
}

exports.setToken = (id, data) => {
  return authRef.doc(id).set(data, { merge: true })
}
