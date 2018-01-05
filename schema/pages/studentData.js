const firebase = require('firebase')
require('firebase/firestore')

const firestore = firebase.firestore()

// variables
let userData, uid

// get all modules
firestore
  .collection('classes')
  .where(`students.${uid}`, '==', true)
  .orderBy('lastAssigned')
  .get()
  .then(docs => docs[0].data())
  .then(({ modules }) => modules)

// get current assignment
let modules
firestore
  .collection('users')
  .doc(uid)
  .onSnapshot(snap => {
    const {
      assignedLesson: { class: classId, lesson: lessonId, module: moduleId }
    } = snap.data()
    const lesson = modules[moduleId].lessons[lessonId]
  })

// component vars
let activityId

firestore
  .collection('activities')
  .where('student', '==', uid)
  .where('activity', '==', activityId)
  .onSnapshot(docs => {
    const activityData = docs[0].data()
  })

/**
 * Write data
 * activity progress
 * class aggregate
 */
