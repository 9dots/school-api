const { firestore } = require('../middlewares/authenticate')
const admin = require('firebase-admin')
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
          message: `Email is already in use by ${user.displayName}`
        }
      ]
    })
  } catch (e) {
    return admin.auth().createUser(credentials)
  }
}
exports.edit = (id, data) => usersRef.doc(id).set(data, { merge: true })

exports.checkForStudentId = (studentId, uid) =>
  usersRef
    .where('studentId', '==', studentId)
    .get()
    .then(
      q =>
        q.empty || (uid && q.docs[0].id === uid)
          ? Promise.resolve()
          : Promise.reject({
            error: 'studentId_taken',
            student: q.docs[0].id,
            errorDetails: [
              { field: 'studentId', message: q.docs[0].get('displayName') }
            ]
          })
    )

exports.checkForUsername = (username, id) =>
  usersRef
    .where('lowerCaseUsername', '==', username)
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
