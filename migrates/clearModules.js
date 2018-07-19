const getServiceAccount = require('../getServiceAccount')
const admin = require('firebase-admin')
const omit = require('@f/omit')

const cert = getServiceAccount('dev')
admin.initializeApp({ credential: admin.credential.cert(cert) })

const firestore = admin.firestore()
const modulesRef = firestore.collection('modules')
const classesRef = firestore.collection('classes')

Promise.all([removeModules(), cleanClasses()])
  .then(() => console.log('done'))
  .catch(console.error)

async function removeModules () {
  const batch = firestore.batch()
  const modules = await modulesRef.get().then(snap => snap.docs)
  modules.forEach(doc => batch.delete(doc.ref))
  return batch.commit()
}

async function cleanClasses () {
  const batch = firestore.batch()
  const classes = await classesRef.get().then(snap => snap.docs)
  classes.forEach(doc =>
    batch.update(doc.ref, {
      assignedLesson: admin.firestore.FieldValue.delete(),
      modules: admin.firestore.FieldValue.delete()
    })
  )
  return batch.commit()
}
