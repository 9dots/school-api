const admin = require('firebase-admin')

const firestore = admin.firestore()
const schoolsRef = firestore.collection('schools')

exports.create = (schoolData, teacher) =>
  schoolsRef.add({
    ...schoolData,
    teachers: {
      [teacher]: true
    }
  })
