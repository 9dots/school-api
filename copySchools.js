const getCert = require('./getServiceAccount')
const admin = require('firebase-admin')
const liveCert = getCert('production')
const devCert = getCert('dev')
const omit = require('@f/omit')

const firebaseDev = admin.initializeApp(
  { credential: admin.credential.cert(devCert) },
  'dev'
)
const firebase = admin.initializeApp({
  credential: admin.credential.cert(liveCert)
})

copySchools()
  .then(() => console.log('done'))
  .catch(console.error)

async function copySchools () {
  const schools = await getSchools()
  return Promise.all(schools.map(setSchool))
}

function setSchool (school) {
  return firebaseDev
    .firestore()
    .collection('schools')
    .doc(school.id)
    .set(omit('id', school))
}

function getSchools () {
  return firebase
    .firestore()
    .collection('schools')
    .get()
    .then(qSnap => qSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })))
}
