const { firestore } = require('../middlewares/authenticate')

const schoolsRef = firestore.collection('schools')

exports.create = (schoolData, teacher) =>
  schoolsRef.add({
    ...schoolData,
    teachers: {
      [teacher]: true
    }
  })
