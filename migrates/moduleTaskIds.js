const getServiceAccount = require('../getServiceAccount')
const admin = require('firebase-admin')
const uuid = require('uuid/v1')

const cert = getServiceAccount('production')
admin.initializeApp({ credential: admin.credential.cert(cert) })

const firestore = admin.firestore()
const modulesRef = firestore.collection('modules')

addModuleTaskIds()
  .then(() => console.log('done'))
  .catch(console.error)

async function addModuleTaskIds () {
  const batch = admin.firestore().batch()
  const modules = await getModules()
  const transformed = modules.map(transformModules)
  const writes = transformed.reduce(
    (acc, mod) => acc.set(modulesRef.doc(mod.id), mod, { merge: true }),
    batch
  )
  return writes.commit()
}

function getModules () {
  return modulesRef
    .get()
    .then(qSnap => qSnap.docs.map(d => ({ ...d.data(), id: d.id })))
}

function transformModules (mod) {
  return {
    ...mod,
    lessons: mod.lessons.map(l => ({
      ...l,
      tasks: l.tasks.map(t => ({ ...t, uuid: uuid() }))
    }))
  }
}
