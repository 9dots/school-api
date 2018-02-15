const { firestore } = require('../middlewares/authenticate')

const modulesRef = firestore.collection('modules')

exports.create = data => modulesRef.add(data)
exports.get = id =>
  modulesRef
    .doc(id)
    .get()
    .then(snap => snap.data())
