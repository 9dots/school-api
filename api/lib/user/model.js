const { firestore } = require('../middlewares/authenticate')
const admin = require('firebase-admin')

const usersRef = firestore.collection('users')

exports.update = (id, data) => usersRef.doc(id).update(data)
exports.set = (id, data, opts) => usersRef.doc(id).set(data, opts)
exports.addAssign = (id, lessonId, data) =>
  usersRef
    .doc(id)
    .collection('assignments')
    .doc(lessonId)
    .set(data)
exports.updateAssign = (id, lessonId, data) =>
  usersRef
    .doc(id)
    .collection('assignments')
    .doc(lessonId)
    .set(data, { merge: true })
exports.get = id =>
  usersRef
    .doc(id)
    .get()
    .then(doc => doc.data())
exports.create = credentials =>
  admin
    .auth()
    .createUser(credentials)
    .then(user => user.uid)
exports.checkForStudentId = id =>
  usersRef
    .where('studentId', '==', id)
    .get()
    .then(
      q =>
        q.empty
          ? Promise.resolve()
          : Promise.reject({
            message: 'studentId_taken',
            details: q.docs[0].get('displayName')
          })
    )
