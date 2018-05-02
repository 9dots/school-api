const { firestore } = require('../middlewares/authenticate')
const arraySet = require('../utils/arraySet')

const coursesRef = firestore.collection('courses')

exports.incrementAssigns = id => incrementAssigns(id, coursesRef, firestore)
exports.update = (id, data) => coursesRef.doc(id).set(data, { merge: true })
exports.updateDraft = (id, draft, data) =>
  coursesRef
    .doc(id)
    .collection('drafts')
    .doc(draft)
    .set(data, { merge: true })
exports.create = (data, owner) =>
  coursesRef.add({ ...data, published: false, owner })
exports.createDraft = async id => {
  try {
    const snap = await coursesRef.doc(id).get()
    await clearDrafts(id, snap)
    return {}
  } catch (e) {
    return Promise.reject({ error: e.message })
  }
}
exports.getDraft = (id, draft) =>
  coursesRef
    .doc(id)
    .collection('drafts')
    .doc(draft)
    .get()
    .then(snap => snap.data())
exports.get = id =>
  coursesRef
    .doc(id)
    .get()
    .then(snap => snap.data())
exports.updateTransaction = updateTransaction
exports.removeLesson = removeLesson
exports.updateLesson = updateLesson
exports.addLesson = addLesson

async function clearDrafts (course, snap) {
  const courseData = snap.data()
  const draftSnap = await coursesRef
    .doc(course)
    .collection('drafts')
    .get()
  if (draftSnap.size > 0) {
    const batch = firestore.batch()
    draftSnap.docs.forEach(doc => batch.set(doc.ref, courseData))
    return batch.commit()
  } else {
    return coursesRef
      .doc(course)
      .collection('drafts')
      .add({ ...courseData, published: false })
  }
}

function buildRef (id, draft) {
  return draft
    ? coursesRef
      .doc(id)
      .collection('drafts')
      .doc(draft)
    : coursesRef.doc(id)
}

function updateTransaction (id, data, draft) {
  const doc = buildRef(id, draft)
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

function addLesson (id, draft, data) {
  const doc = coursesRef
    .doc(id)
    .collection('drafts')
    .doc(draft)
  return firestore.runTransaction(t => {
    return t.get(doc).then(d => {
      const lessons = d.get('lessons') || []
      t.update(doc, {
        lessons: lessons.concat({ ...data, index: lessons.length })
      })
    })
  })
}

function removeLesson (id, draft, lessonId) {
  const doc = coursesRef
    .doc(id)
    .collection('drafts')
    .doc(draft)
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

function updateLesson (id, draft, lessonId, fn) {
  const doc = coursesRef
    .doc(id)
    .collection('drafts')
    .doc(draft)
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
