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

// Progress
exports.getProgressRef = (id, lesson, user) =>
  modulesRef
    .doc(id)
    .collection('progress')
    .doc(lesson)
    .collection('users')
    .doc(user)
exports.getProgress = (id, lesson, user) =>
  exports
    .getProgressRef(id, lesson, user)
    .get()
    .then(snap => (snap.exists ? snap.data() : undefined))
exports.setProgress = (id, lesson, user, data, opts = {}) => {
  const ref = exports.getProgressRef(id, lesson, user)
  const { batch } = opts
  if (batch) {
    return batch.set(ref, data, { merge: true })
  }
  return ref.set(data, { merge: true })
}
exports.setActive = (id, lesson, user, task, opts = {}) => {
  const ref = exports.getProgressRef(id, lesson, user)
  const { batch } = opts
  if (batch) {
    return batch.set(ref, { active: task, started: true }, { merge: true })
  }
  return ref.set({ active: task, started: true }, { merge: true })
}
exports.updateProgress = (id, lesson, user, data, opts = {}) => {
  const ref = exports.getProgressRef(id, lesson, user)
  const { batch } = opts
  if (batch) {
    return batch.set(ref, { tasks: data }, { merge: true })
  }
  return ref.set({ tasks: data }, { merge: true })
}
