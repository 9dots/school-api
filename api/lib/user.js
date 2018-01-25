const { checkForDoc, checkForDocs } = require('./utils/checkForDoc')
const admin = require('firebase-admin')

function teacherSignUp (firestore, uid, { school, teacher, displayName, name }) {
  return checkForDocs(firestore, [
    [`schools/${school}`, 'school'],
    [
      `users/${teacher}`,
      'user',
      snap => !snap.get(`schools.${school}`),
      new Error('already_enrolled')
    ]
  ]).then(() =>
    firestore
      .collection('users')
      .doc(teacher)
      .update({
        [`schools.${school}`]: true,
        'nav.school': school,
        displayName,
        name
      })
  )
}

function createStudent (firestore, uid, { school, studentId, name }) {
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
            studentId,
            displayName,
            name,
            schools: { [school]: 'student' }
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

function setCurrentSchool (firestore, uid, { school }) {
  return checkForDoc(
    firestore,
    `users/${uid}`,
    'user',
    snap => !!snap.get(`schools.${school}`),
    new Error('not_enrolled')
  ).then(() =>
    firestore
      .collection('users')
      .doc(uid)
      .update({ currentSchool: school })
  )
}

function setCurrentClass (firestore, uid, { school }) {
  return checkForDoc(
    firestore,
    `users/${uid}`,
    'user',
    snap => !!snap.get(`schools.${school}`),
    new Error('not_enrolled')
  ).then(() =>
    firestore
      .collection('users')
      .doc(uid)
      .update({ currentSchool: school })
  )
}

module.exports = {
  setCurrentSchool,
  setCurrentClass,
  teacherSignUp,
  createStudent,
  setNav
}
