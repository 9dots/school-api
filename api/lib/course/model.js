const { firestore } = require('../middlewares/authenticate')
const arraySet = require('../utils/arraySet')

const coursesRef = firestore.collection('courses')

exports.addLesson = addLesson
exports.updateLesson = updateLesson
exports.removeLesson = removeLesson
exports.updateTransaction = updateTransaction
exports.create = (data, owner) =>
  coursesRef.add({ ...data, published: false, owner })
exports.update = (id, data) => coursesRef.doc(id).set(data, { merge: true })
exports.incrementAssigns = id => incrementAssigns(id, coursesRef, firestore)
exports.get = id =>
  coursesRef
    .doc(id)
    .get()
    .then(snap => snap.data())

function updateTransaction (id, data) {
  const doc = coursesRef.doc(id)
  return firestore.runTransaction(t => {
    return t.get(doc).then(d => {
      const docData = d.data()
      t.set(doc, {
        ...docData,
        ...data
      })
    })
  })
}

function addLesson (id, data) {
  const doc = coursesRef.doc(id)
  return firestore.runTransaction(t => {
    return t.get(doc).then(d => {
      const lessons = d.get('lessons') || []
      t.update(doc, {
        lessons: lessons.concat({ ...data, index: lessons.length })
      })
    })
  })
}

function removeLesson (id, lessonId) {
  const doc = coursesRef.doc(id)
  return firestore.runTransaction(t => {
    return t.get(doc).then(d => {
      const lessons = d.get('lessons') || []
      t.update(doc, {
        lessons: lessons
          .filter(l => l.id !== lessonId)
          .map((l, i) => ({ ...l, index: i }))
      })
    })
  })
}

function updateLesson (id, lessonId, fn) {
  const doc = coursesRef.doc(id)
  return firestore.runTransaction(t => {
    return t.get(doc).then(d => {
      const lessons = d.get('lessons') || []
      const lesson = lessons.find(l => l.id === lessonId)
      t.update(doc, {
        lessons: arraySet(lessons, lessons.indexOf(lesson), fn(lesson)).map(
          (lesson, i) => ({ ...lesson, index: i })
        )
      })
    })
  })
}

function incrementAssigns (id, coursesRef) {
  const doc = coursesRef.doc(id)
  return firestore.runTransaction(t => {
    return t.get(doc).then(d => {
      t.update(doc, {
        assigns: (d.get('assigns') || 0) + 1
      })
    })
  })
}
