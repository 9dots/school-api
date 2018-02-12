const { checkForDoc, checkForDocs } = require('./utils/checkForDoc')
const foreach = require('@f/foreach')
const firebase = require('firebase')
const uuidv1 = require('uuid/v1')

require('firebase/firestore')

// function addCourse (classId, moduleId) {
//   return Promise.all([
//     getRef('classes', classId).update({
//       modules: {
//         [uuidv1()]: moduleId
//       }
//     }),
//     firestore.runTransaction(t => {
//       return t.get(getRef('modules', moduleId)).then(doc => {
//         t.update(getRef('modules', moduleId), {
//           assigns: (doc.get('assigns') || 0) + 1
//         })
//       })
//     })
//   ])
// }

// function assignLesson (classId, moduleInstance, lessonId) {
//   return getRef('classes', classId)
//     .get()
//     .then(doc => doc.get('students'))
//     .then(students => {
//       const batch = firestore.batch()
//       batch.update(getRef('classes', classId), {
//         modules: {
//           [moduleInstance]: {
//             active: true
//           }
//         }
//       })
//       foreach(
//         (val, ref) =>
//           batch.update(firestore.collection('users').doc(ref), {
//             assignedLesson: {
//               class: classId,
//               module: moduleInstance,
//               lesson: lessonId
//             }
//           }),
//         students
//       )
//       return batch.commit()
//     })
// }

// function addTeacher (classId, uid) {
//   return getRef('classes', classId).update({ teachers: { [uid]: true } })
// }

// function removeTeacher (classId, uid) {
//   return getRef('classes', classId).update({
//     [`teachers.${uid}`]: firebase.firestore.FieldValue.delete()
//   })
// }

function removeStudents (firestore, uid, { class: classId, students }) {
  return checkForDocs(firestore, [
    [`classes/${classId}`, 'class'],
    ...students.map(ref => [`users/${ref}`, `user_${ref}`])
  ]).then(() =>
    firestore
      .batch()
      .update(firestore.doc(`/classes/${classId}`), ...studentsByRef(students))
      .commit()
  )
}

function addStudent (firestore, uid, { class: classId, student }) {
  return checkForDocs(firestore, [
    [`classes/${classId}`, 'class'],
    [`users/${student}`, 'student']
  ])
    .then(() =>
      firestore.doc(`classes/${classId}`).update({
        [`students.${student}`]: 'student'
      })
    )
    .catch(e => Promise.reject(e))
}

function createClass (firestore, uid, { school, ...classData }) {
  return checkForDoc(firestore, `schools/${school}`, 'school')
    .then(() =>
      firestore.collection('classes').add({
        ...classData,
        owner: uid,
        school: school,
        teachers: {
          [uid]: true
        }
      })
    )
    .then(ref => ({ class: ref.id }))
}

/**
 * utils
 */

function studentsByRef (students, val = true) {
  return students.map(ref => ({ [`students.${ref}`]: val }))
}

module.exports = {
  // removeTeacher,
  // assignLesson,
  removeStudents,
  addStudent,
  createClass
  // addTeacher,
  // addCourse
}