const firebase = require('firebase-admin')
const { firestore } = require('../middlewares/authenticate')

const classesRef = firestore.collection('classes')

exports.addUser = (id, user, role) =>
  classesRef.doc(id).update({ [`${role}s.${user}`]: true })
exports.removeUser = (id, user, role) =>
  classesRef.doc(id).update({
    [`${role}s.${user}`]: firebase.firestore.FieldValue.delete()
  })
exports.create = (data, me) =>
  classesRef
    .add({ ...data, teachers: { [me]: true } })
    .then(ref => ({ class: ref.id }))
