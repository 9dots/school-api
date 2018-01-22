const { checkForDoc, checkForDocs } = require('./utils/checkForDoc')

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
        [`schools.${school}`]: 'teacher',
        displayName,
        name
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

module.exports = {
  setCurrentSchool,
  teacherSignUp
}
