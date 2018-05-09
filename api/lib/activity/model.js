const { firestore } = require('../middlewares/authenticate')

const activitiesRef = firestore.collection('activities')

const defaults = {
  completed: false,
  started: false,
  active: false,
  progress: 0,
  score: 0
}

// exports.add = data => console.log(Object.assign({}, data, defaults))
exports.transaction = firestore.runTransaction
exports.batch = () => firestore.batch()
exports.getRef = id => activitiesRef.doc(id)
exports.add = (id, data) =>
  activitiesRef.doc(id).set(Object.assign({}, defaults, data))
exports.get = id =>
  activitiesRef
    .doc(id)
    .get()
    .then(snap => snap.data())
exports.update = (id, data) => activitiesRef.doc(id).update(data)
exports.createBatch = async (activities = []) => {
  if (!activities.length) return
  const batch = firestore.batch()
  activities.forEach(activity => {
    batch.set(activitiesRef.doc(activity.id), activity)
  })
  return batch.commit()
}
exports.findByModule = (user, module, lesson, task) =>
  activitiesRef
    .where('student', '==', user)
    .where('module', '==', module)
    .where('lesson', '==', lesson)
    .where('task', '==', task)
    .get()
    .then(snap => !snap.empty)
exports.findActive = (user, lesson) =>
  activitiesRef
    .where('student', '==', user)
    .where('lesson', '==', lesson)
    .where('active', '==', true)
    .get()
    .then(snap => snap.docs.map(doc => doc.id))
