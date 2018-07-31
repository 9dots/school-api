Array.prototype.flatMap = function (lambda) {
  return Array.prototype.concat.apply([], this.map(lambda))
}

const getServiceAccount = require('../getServiceAccount')
const admin = require('firebase-admin')
const chunk = require('lodash/chunk')

const cert = getServiceAccount('dev')
admin.initializeApp({ credential: admin.credential.cert(cert) })

const firestore = admin.firestore()
const modulesRef = firestore.collection('modules')
const classesRef = firestore.collection('classes')
const usersRef = firestore.collection('users')

Promise.all([removeModules(), cleanClasses(), clearStudents()])
  .then(() => console.log('done'))
  .catch(console.error)

async function removeModules () {
  const batch = firestore.batch()
  const modules = await modulesRef.get().then(snap => snap.docs)
  await removeProgress(modules)
  modules.forEach(doc => batch.delete(doc.ref))
  return batch.commit()
}

async function removeProgress (modules) {
  const batch = firestore.batch()
  // console.log(modules)
  const progress = await Promise.all(
    modules.flatMap(mod =>
      mod.ref
        .collection('progress')
        .get()
        .then(snap => snap.docs)
    )
  ).then(vals => vals.reduce((acc, next) => acc.concat(next), []))
  if (progress.length) {
    progress.forEach(prog => batch.delete(prog.ref))
    await removeStudentProgress(progress)
    return batch.commit()
  }
}

async function removeStudentProgress (progress) {
  const batch = firestore.batch()
  const students = await Promise.all(
    progress.flatMap(mod =>
      mod.ref
        .collection('users')
        .get()
        .then(snap => snap.docs)
    )
  ).then(vals => vals.reduce((acc, next) => acc.concat(next), []))
  if (students.length) {
    students.forEach(student => batch.delete(student.ref))
    return batch.commit()
  }
}

async function clearStudents () {
  const students = await usersRef.get().then(snap => snap.docs)
  const groups = chunk(students, 500)
  const batches = groups.map(group => {
    const batch = firestore.batch()
    group.forEach(user =>
      batch.update(user.ref, {
        activeTask: admin.firestore.FieldValue.delete()
      })
    )
    return batch.commit()
  })
  return Promise.all(batches)
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
