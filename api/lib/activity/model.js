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
exports.add = data => activitiesRef.add(Object.assign({}, data, defaults))
exports.update = (id, data) => activitiesRef.doc(id).update(data)
exports.findByModule = (module, lesson, task) =>
  activitiesRef
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
