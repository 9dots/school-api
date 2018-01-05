const firebase = require('firebase')
require('firebase/firestore')

const firestore = firebase.firestore()

let moduleId

firestore
  .collection('modules')
  .doc(moduleId)
  .get()
