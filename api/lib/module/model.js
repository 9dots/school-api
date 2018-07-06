const admin = require('firebase-admin')

const firestore = admin.firestore()
const modulesRef = firestore.collection('modules')

exports.fsBatch = () => firestore.batch()
exports.getRef = id => modulesRef.doc(id)
exports.create = data => modulesRef.add(data)
exports.set = (id, data) => modulesRef.doc(id).set(data)
exports.update = (id, data) => modulesRef.doc(id).update(data)
exports.get = id =>
  modulesRef
    .doc(id)
    .get()
    .then(snap => snap.data())
exports.getByCourse = course =>
  modulesRef
    .where('course.ref', '==', course)
    .get()
    .then(qSnap =>
      qSnap.docs.map(doc => Object.assign({}, doc.data(), { id: doc.id }))
    )
