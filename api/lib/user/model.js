const { firestore } = require('../middlewares/authenticate')
const admin = require('firebase-admin')
const { resolve, reject } = Promise

const usersRef = firestore.collection('users')

exports.update = (id, data) => usersRef.doc(id).update(data)
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
          ? resolve()
          : reject({
            message: 'studentId_taken',
            details: q.docs[0].get('displayName')
          })
    )
