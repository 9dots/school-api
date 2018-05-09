const admin = require('firebase-admin')
const omit = require('@f/omit')
const cert = getServiceAccount()

const firebase = admin.initializeApp({
  credential: admin.credential.cert(cert)
})

const firestore = firebase.firestore()
const classesRef = firestore.collection('classes')

async function migratePasswordTypes () {
  const classes = await getClasses()
  const transformed = classes.map(transformClass)
  return Promise.all(
    transformed.map(cls =>
      classesRef.doc(cls.id).set(omit('id', cls), { merge: true })
    )
  )
}

migratePasswordTypes().then(() => console.log('done'))

function getClasses () {
  return classesRef
    .get()
    .then(qSnap => qSnap.docs.map(d => ({ ...d.data(), id: d.id })))
}

function transformClass (cls) {
  return {
    ...cls,
    passwordType: 'image'
  }
}

function getServiceAccount () {
  try {
    return require('./secret.json')
  } catch (e) {
    return {
      projectId: process.env.PROJECT_ID,
      clientEmail: process.env.CLIENT_EMAIL,
      privateKey: process.env.SECRET_KEY.replace(/\\n/g, '\n')
    }
  }
}
