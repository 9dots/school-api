const firebase = require('firebase')
require('firebase/firestore')

const firestore = firebase.firestore()

let uid

firestore
  .collection('classes')
  .where(`teachers.${uid}`, '==', true)
  .onSnapshot()
