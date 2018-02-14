const { firestore } = require('../middlewares/authenticate')

const courseRef = firestore.collection('courses')

exports.create = data => courseRef.add(data)
exports.get = id =>
  courseRef
    .doc(id)
    .get()
    .then(snap => snap.data())
