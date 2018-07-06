const admin = require('admin-admin')
const Username = require('../username')

const firestore = admin.firestore()
const usersRef = firestore.collection('users')

const getRef = id => usersRef.doc(id)
exports.getRef = getRef
exports.update = (id, data) => usersRef.doc(id).update(data)
exports.getCredential = id => admin.auth().createCustomToken(id)
exports.set = (id, data, opts) => usersRef.doc(id).set(data, opts)
exports.addAssign = (id, lessonId, data) =>
  usersRef
    .doc(id)
    .collection('assignments')
    .doc(lessonId)
    .set(data)
exports.get = id =>
  usersRef
    .doc(id)
    .get()
    .then(doc => doc.data())
exports.create = async credentials => {
  try {
    const user = await admin.auth().getUserByEmail(credentials.email)
    return Promise.reject({
      error: 'email_in_use',
      student: user.uid,
      errorDetails: [
        {
          field: 'email',
          message: 'Email already in use'
        }
      ]
    })
  } catch (e) {
    return admin.auth().createUser(credentials)
  }
}
exports.edit = (id, data) =>
  firestore.runTransaction(t => {
    const doc = usersRef.doc(id)
    return t.get(doc).then(async d => {
      try {
        const { username } = d.data()
        if (username !== data.username) {
          await Username.create(data.username, username)
        }
        return t.set(d.ref, data, { merge: true })
      } catch (e) {
        console.error(e)
      }
    })
  })

exports.checkForUsername = (username, id) =>
  usersRef
    .where('username', '==', username.toLowerCase())
    .get()
    .then(
      q =>
        q.empty || q.docs[0].id === id
          ? Promise.resolve()
          : Promise.reject({
            error: 'username_taken',
            student: q.docs[0].id,
            errorDetails: [{ field: 'username', message: 'username_taken' }]
          })
    )
