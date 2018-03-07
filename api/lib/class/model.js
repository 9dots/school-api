const firebase = require('firebase-admin')
const { firestore } = require('../middlewares/authenticate')

const classesRef = firestore.collection('classes')

exports.update = (id, data) => classesRef.doc(id).update(data)
exports.addUser = (id, user, role) =>
  classesRef
    .doc(id)
    .update({ [`${role}s.${user}`]: true, [`members.${user}`]: true })
exports.removeUser = (id, user, role) =>
  classesRef.doc(id).update({
    [`${role}s.${user}`]: firebase.firestore.FieldValue.delete(),
    [`members.${user}`]: firebase.firestore.FieldValue.delete()
  })
exports.create = (data, me) =>
  classesRef
    .add({ ...data, teachers: { [me]: true }, members: { [me]: true } })
    .then(ref => ({ class: ref.id }))
exports.getStudents = id =>
  classesRef
    .doc(id)
    .get()
    .then(doc => doc.get('students'))
    .then(students => Object.keys(students))
exports.addToSubcollection = (id, field, data) =>
  classesRef
    .doc(id)
    .collection(field)
    .add(data)
