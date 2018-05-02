const Activity = require('../activity')
const Module = require('../module')
const Class = require('./model')

exports.createClass = Class.create
exports.get = Class.get

exports.removeStudent = ({ class: cls, student: user }) =>
  Class.update(cls, removeUser(user, 'student'))
exports.addStudent = ({ class: cls, student: user }) =>
  Class.update(cls, addUser(user, 'student'))

exports.removeTeacher = ({ class: cls, teacher }, me) =>
  Class.update(cls, removeUser(teacher || me, 'teacher'))
exports.addTeacher = ({ class: cls, teacher }, me) =>
  Class.update(cls, addUser(teacher || me, 'teacher'))

exports.removeStudents = async ({ class: cls, students }) => {
  try {
    console.log(cls)
    const classRef = Class.getRef(cls)
    const batch = students.reduce(
      (acc, student) => acc.update(classRef, removeUser(student, 'student')),
      Class.batch
    )
    return batch.commit()
  } catch (e) {
    return Promise.reject(e)
  }
}
exports.addStudents = ({ class: cls, students }) => {
  const classRef = Class.getRef(cls)
  const batch = students.reduce(
    (acc, student) => acc.update(classRef, addUser(student, 'student')),
    Class.batch
  )
  return batch.commit()
}

exports.assignLesson = async data => {
  try {
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
    await Activity.createBatch(
      activities.reduce((acc, act) => acc.concat(...act), [])
    )
    return Class.update(cls, {
      assignedLesson: lessonData
    })
  } catch (e) {
    return Promise.reject(e)
  }
}
exports.addCourse = async ({ class: cls, course }) => {
  try {
    const { module: mod } = await Module.createCopy({ course, class: cls })
    return Class.update(cls, {
      [`modules.${mod}.active`]: false,
      [`modules.${mod}.course`]: mod
    })
  } catch (e) {
    return Promise.reject(e)
  }
}

/**
 * Utils
 */

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
