const admin = require('firebase-admin')

const firestore = admin.firestore()
const classesRef = firestore.collection('classes')

exports.getTimestamp = () => admin.firestore.FieldValue.serverTimestamp()
exports.update = (id, data) => classesRef.doc(id).update(data)
exports.deleteValue = admin.firestore.FieldValue.delete()
exports.createBatch = () => firestore.batch()
exports.getRef = id => classesRef.doc(id)

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
