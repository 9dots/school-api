const { checkForDoc, checkForDocs } = require('./utils/checkForDoc')
const admin = require('firebase-admin')

function teacherSignUp (firestore, uid, { school, teacher, displayName, name }) {
  return checkForDocs(firestore, [[`schools/${school}`, 'school']]).then(() =>
    firestore
      .collection('users')
      .doc(teacher)
      .update({
        [`schools.${school}`]: 'teacher',
        'nav.school': school,
        displayName,
        name
      })
  )
}

function addToSchool (firestore, uid, { school, user, role }) {
  return checkForDoc(firestore, `schools/${school}`, 'school').then(() =>
    firestore
      .collection('users')
      .doc(user)
      .update({
        [`schools.${school}`]: role,
        'nav.school': school
      })
  )
}

function createStudent (firestore, uid, { school, studentId, name, email }) {
  const displayName = `${name.given} ${name.family}`
  return checkForStudentId(firestore, studentId).then(() =>
    admin
      .auth()
      .createUser({
        displayName
      })
      .then(user => user.uid)
      .then(student =>
        firestore
          .collection('users')
          .doc(student)
          .set({
            schools: { [school]: 'student' },
            'nav.school': school,
            email: email || null,
            displayName,
            studentId,
            name
          })
          .then(snap => ({ student }))
      )
  )
}

function setNav (firestore, uid, data) {
  return firestore.doc(`/users/${uid}`).update(data)
}

function checkForStudentId (firestore, studentId) {
  return firestore
    .collection('users')
    .where('studentId', '==', studentId)
    .get()
    .then(
      qSnap =>
        qSnap.empty
          ? Promise.resolve()
          : Promise.reject({
            message: 'studentId_taken',
            details: qSnap.docs[0].get('displayName')
          })
    )
}

module.exports = {
  teacherSignUp,
  createStudent,
  addToSchool,
  setNav
}
