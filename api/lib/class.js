const foreach = require('@f/foreach')
const firebase = require('firebase')
const uuidv1 = require('uuid/v1')

require('firebase/firestore')
const firestore = firebase.firestore()

function addCourse (classId, moduleId) {
  return Promise.all([
    getRef('classes', classId).update({
      modules: {
        [uuidv1()]: moduleId
      }
    }),
    firestore.runTransaction(t => {
      return t.get(getRef('modules', moduleId)).then(doc => {
        t.update(getRef('modules', moduleId), {
          assigns: (doc.get('assigns') || 0) + 1
        })
      })
    })
  ])
}

function assignLesson (classId, moduleInstance, lessonId) {
  return getRef('classes', classId)
    .get()
    .then(doc => doc.get('students'))
    .then(students => {
      const batch = firestore.batch()
      batch.update(getRef('classes', classId), {
        modules: {
          [moduleInstance]: {
            active: true
          }
        }
      })
      foreach(
        (val, ref) =>
          batch.update(firestore.collection('users').doc(ref), {
            assignedLesson: {
              class: classId,
              module: moduleInstance,
              lesson: lessonId
            }
          }),
        students
      )
      return batch.commit()
    })
}

function addStudents (classId, schoolId, students) {
  return firestore
    .batch()
    .update(getRef('classes', classId), studentsByRef(students))
    .update(getRef('schools', schoolId), studentsByRef(students))
    .commit()
}

function removeStudents (classId, students) {
  return getRef('classes', classId).update(
    studentsByRef(students, firebase.firestore.FieldValue.delete())
  )
}

function addTeacher (classId, uid) {
  return getRef('classes', classId).update({ teachers: { [uid]: true } })
}

function removeTeacher (classId, uid) {
  return getRef('classes', classId).update({
    [`teachers.${uid}`]: firebase.firestore.FieldValue.delete()
  })
}

/**
 * utils
 */

function studentsByRef (students, val = true) {
  return students.map(ref => ({ [`students.${ref}`]: val }))
}

function getRef (collection, doc) {
  return firestore.collection(collection).doc(doc)
}

module.exports = {
  removeStudents,
  removeTeacher,
  assignLesson,
  addStudents,
  addTeacher,
  addCourse
}
