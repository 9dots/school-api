const { firestore } = require('../middlewares/authenticate')

const coursesRef = firestore.collection('courses')

exports.get = id =>
  coursesRef
    .doc(id)
    .get()
    .then(snap => snap.data())
exports.incrementAssigns = id => incrementAssigns(id, coursesRef, firestore)

function incrementAssigns (id, coursesRef) {
  const doc = coursesRef.doc(id)
  return firestore.runTransaction(t => {
    return t.get(doc).then(d => {
      t.update(doc, {
        assigns: (d.get('assigns') || 0) + 1
      })
    })
  })
}
