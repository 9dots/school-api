const firebase = require('firebase')
const uuidv1 = require('uuid/v1')
require('firebase/firestore')

const firestore = firebase.firestore()

let uid

firestore
  .collection('classes')
  .where(`teachers.${uid}`, '==', true)
  .onSnapshot()

/**
 * Write data
 * classes.addCourse
 */
