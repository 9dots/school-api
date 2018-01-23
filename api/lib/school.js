const { checkForDoc, checkForDocs } = require('./utils/checkForDoc')
const admin = require('firebase-admin')

/**
 * create
 * @param {Object} firestore - firestore instance
 * @param {String} uid - firebase user id
 * @param {Object} schoolData - Object of schoolData
 * @param {String} schoolData.displayName - Display name of the school (required)
 * @return {Promise} - Promise containing new document ID on success or error
 */
function create (firestore, uid, schoolData) {
  return firestore
    .collection('schools')
    .add({
      ...schoolData,
      teachers: {
        [uid]: true
      }
    })
    .then(docSnap => ({ docId: docSnap.id }))
}

function addTeacher (firestore, uid, { school, teacher }) {
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
        [`schools.${school}`]: 'teacher'
      })
      .catch(e => Promise.reject(new Error('school_not_found')))
  )
}

function removeTeacher (firestore, uid, { teacher, school }) {
  return checkForDoc(
    firestore,
    `users/${teacher}`,
    'user',
    snap => !!snap.get(`schools.${school}`),
    new Error('not_enrolled')
  ).then(() =>
    firestore
      .collection('schools')
      .doc(school)
      .update({
        [`teachers.${uid}`]: admin.firestore.FieldValue.delete()
      })
  )
}

module.exports = {
  removeTeacher,
  addTeacher,
  create
}
