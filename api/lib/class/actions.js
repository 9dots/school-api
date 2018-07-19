const getInstances = require('../utils/getInstances')
const mapValues = require('@f/map-values')
const Activity = require('../activity')
const admin = require('firebase-admin')
const Module = require('../module')
const Class = require('./model')
const Auth = require('../auth')
const User = require('../user')

const firestore = admin.firestore()

exports.createClass = Class.create
exports.get = Class.get

exports.removeStudent = ({ class: cls, student: user }) =>
  Class.update(cls, removeUser(user, 'student'))
exports.addStudent = async ({ class: cls, student: user }) => {
  const { passwordType } = await Class.get(cls)
  const { passwords = {} } = await User.get(user)
  if (!passwords[passwordType]) {
    await Promise.all([
      User.setInsecurePassword({ user, type: passwordType }),
      User.setNav({ class: cls }, user)
    ])
  }
  return Class.update(cls, addUser(user, 'student'))
}

exports.removeTeacher = ({ class: cls, teacher }, me) =>
  Class.update(cls, removeUser(teacher || me, 'teacher'))
exports.addTeacher = ({ class: cls, teacher }, me) =>
  Class.update(cls, addUser(teacher || me, 'teacher'))

exports.removeStudents = async ({ class: cls, students }) => {
  try {
    const classRef = await Class.getRef(cls)
    const batch = students.reduce(
      (acc, student) => acc.update(classRef, removeUser(student, 'student')),
      Class.createBatch()
    )
    return batch.commit()
  } catch (e) {
    return Promise.reject(e)
  }
}
exports.addStudents = async ({ class: cls, students }) => {
  const classRef = Class.getRef(cls)
  const { passwordType } = await Class.get(cls)
  const batch = students.reduce(
    (acc, student) => acc.update(classRef, addUser(student, 'student')),
    Class.createBatch()
  )
  await batch.commit()
  setPasswordType({ class: cls, passwordType })
  return {}
}

exports.assignLesson = async (data, user) => {
  try {
    const { tokens } = await Auth.getAccessToken(null, user)
    const { class: cls, lesson, module } = data
    const { students = {}, teachers } = await Class.get(cls)
    const { lessons } = await Module.get(module)
    const lessonData = lessons.find(l => l.id === lesson)
    const activities = await Promise.all(
      Object.keys(students).map((student, i) =>
        Activity.getActivities({
          ...data,
          lesson: lessonData,
          user: student,
          teachers
        })
      )
    )
    getInstances(
      activities.reduce((acc, act) => acc.concat(...act), []),
      tokens
    ).then(Activity.createBatch)
    return Class.update(cls, {
      assignedLesson: { id: lesson, module }
    })
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}

exports.setPasswordType = setPasswordType

exports.addCourse = async ({ class: cls, course }) => {
  const classRef = await Class.getRef(cls)
  return firestore.runTransaction(t => {
    return t.get(classRef).then(async d => {
      const docData = d.data()

      // Check is course has already been added
      const isAssigned = !!mapValues(
        mod => mod.course === course,
        docData.modules || {},
        []
      ).filter(val => val).length

      if (!isAssigned) {
        const { module: mod } = await Module.createCopy({
          course,
          class: cls
        })
        t.update(classRef, {
          [`modules.${mod}.ts`]: Date.now(),
          [`modules.${mod}.course`]: course
        })
      }
    })
  })
}

exports.updateDetails = async ({ class: cls, ...data }) => {
  try {
    return Class.update(cls, data)
  } catch (e) {
    return Promise.reject(e)
  }
}

/**
 * Utils
 */

async function setPasswordType ({ class: cls, passwordType }) {
  try {
    const { students = {} } = await Class.get(cls)
    const batch = await Object.keys(students).reduce(async (acc, student) => {
      const b = await acc
      const password = await User.maybeGeneratePassword({
        user: student,
        type: passwordType
      })
      if (password) {
        return b.update(User.getRef(student), password)
      }
      return b
    }, Class.createBatch().update(Class.getRef(cls), { passwordType }))
    return batch.commit()
  } catch (e) {
    return Promise.reject(e)
  }
}

/**
 * @function addUser
 * @param {string} user - uid to add
 * @param {string} role - role of user ('teacher' or 'student')
 * @returns {object} - firestore update object
 */
function addUser (user, role) {
  return { [`${role}s.${user}`]: true, [`members.${user}`]: true }
}

/**
 * @function removeUser
 * @param {string} user - uid to add
 * @param {string} role - role of user ('teacher' or 'student')
 * @returns {object} - firestore update object
 */
function removeUser (user, role) {
  return {
    [`${role}s.${user}`]: Class.deleteValue,
    [`members.${user}`]: Class.deleteValue
  }
}
