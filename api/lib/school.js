const firebase = require('firebase')

require('firebase/firestore')
const firestore = firebase.firestore()

function createSchool (uid, schoolData) {
  return firestore.collection('schools').add({
    ...schoolData,
    [`teachers.${uid}`]: true
  })
}

function createClass (uid, schoolId, classData) {
  return firestore.collection('classes').add({
    ...classData,
    owner: uid,
    school: schoolId,
    [`teachers.${uid}`]: true
  })
}

function addTeacher (uid, schoolId) {
  return firestore
    .collection('schools')
    .doc(schoolId)
    .update({
      [`teachers.${uid}`]: true
    })
}

function removeTeacher (uid, schoolId) {
  return firestore
    .collection('schools')
    .doc(schoolId)
    .update({
      [`teachers.${uid}`]: firebase.firestore.FieldValue.delete()
    })
}

module.exports = {
  removeTeacher,
  createSchool,
  createClass,
  addTeacher
}
