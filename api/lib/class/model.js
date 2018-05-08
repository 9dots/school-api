const firebase = require('firebase-admin')
const { firestore } = require('../middlewares/authenticate')

const classesRef = firestore.collection('classes')

exports.createBatch = () => firestore.batch()
exports.deleteValue = firebase.firestore.FieldValue.delete()
exports.getRef = id => classesRef.doc(id)
exports.update = (id, data) => classesRef.doc(id).update(data)

exports.create = (data, me) =>
  classesRef
    .add({
      ...data,
      passwordType: 'image',
      teachers: { [me]: true },
      members: { [me]: true }
    })
    .then(ref => ({ class: ref.id }))
exports.get = id =>
  classesRef
    .doc(id)
    .get()
    .then(doc => doc.data())

exports.addToSubcollection = (id, field, data) =>
  classesRef
    .doc(id)
    .collection(field)
    .add(data)
