const firebase = require('firebase')
require('firebase/firestore')

const firestore = firebase.firestore()

firestore.collection('modules').where('featured', '==', true)
