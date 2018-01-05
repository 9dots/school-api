const mapValues = require('@f/map-values')
const firebase = require('firebase')
require('firebase/firestore')

const firestore = firebase.firestore()

/**
 * get classes
 * variables: uid
 */

firestore
  .collection('classes')
  .where(`teachers.${uid}`, '==', true)
  .onSnapshot(docs => {
    const classes = docs.map(d => d.data())
  })

/**
 * get module details
 * variables: cls, moduleId, uid
 */

firestore
  .collection('modules')
  .doc(moduleId)
  .onSnapshot(snap => {
    const moduleData = snap.data()
  })

/**
 * Write data
 * assign
 * assign pushes to all students in class
 */

function assign (req, res) {
  const { students, lesson } = req.body
  return mapValues((val, key) => {
    return firestore
      .collection('users')
      .doc(key)
      .update({ assignedLesson: lesson })
  }, students)
}
