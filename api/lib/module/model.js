const { firestore } = require('../middlewares/authenticate')

const moduleRef = firestore.collection('modules')

exports.get = id => {
  console.log(id, moduleRef)
  return moduleRef
    .doc(id)
    .get()
    .then(snap => snap.data())
}
exports.incrementAssigns = id => incrementAssigns(id, moduleRef, firestore)

function incrementAssigns (id, moduleRef) {
  const doc = moduleRef.doc(id)
  return firestore.runTransaction(t => {
    return t.get(doc).then(d => {
      t.update(doc, {
        assigns: (d.get('assigns') || 0) + 1
      })
    })
  })
}
