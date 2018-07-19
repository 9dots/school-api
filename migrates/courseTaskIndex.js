const getServiceAccount = require('../getServiceAccount')
const admin = require('firebase-admin')
const omit = require('@f/omit')

const cert = getServiceAccount('dev')
admin.initializeApp({ credential: admin.credential.cert(cert) })

const firestore = admin.firestore()
const coursesRef = firestore.collection('courses')

migrateTaskIndex()
  .then(() => console.log('done'))
  .catch(console.error)

async function migrateTaskIndex () {
  const batch = admin.firestore().batch()
  const courses = await getCourses()
  const transformed = courses.map(transformCourses)
  const writes = transformed.reduce(
    (acc, course) =>
      acc.set(coursesRef.doc(course.id), omit('id', course), { merge: true }),
    batch
  )
  return writes.commit()
}

function getCourses () {
  return coursesRef
    .get()
    .then(qSnap => qSnap.docs.map(d => ({ ...d.data(), id: d.id })))
}

function transformCourses (course) {
  return {
    ...course,
    lessons: (course.lessons || []).map(l => ({
      ...l,
      tasks: l.tasks.map((t, i) => ({ ...t, index: i }))
    }))
  }
}
