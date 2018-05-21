const getInstances = require('../utils/getInstances')
const { getRandomPassword } = require('./utils')
const Activity = require('../activity')
const Module = require('../module')
const User = require('./model')

exports.get = User.get
exports.getRef = User.getRef
exports.teacherSignUp = ({ school, teacher, ...additional }) =>
  User.update(teacher, {
    [`schools.${school}`]: true,
    role: 'teacher',
    ...additional
  })
exports.addToSchool = ({ school, user, role }) =>
  User.update(user, {
    [`schools.${school}`]: role
  })
exports.setNav = ({ class: cls }, me) =>
  User.update(me, {
    nav: cls
  })
exports.setInsecurePassword = ({ user, password, type }) =>
  User.update(user, {
    [`passwords.${type}`]: password || getRandomPassword(type)
  })
exports.maybeGeneratePassword = async ({ user, type }) => {
  const { passwords = {} } = await User.get(user)
  if (!passwords[type]) {
    return generateInsecurePassword(type)
  }
  return null
}
exports.createStudent = async data => {
  const { name, studentId, email } = data
  const displayName = `${name.given} ${name.family}`
  try {
    await User.checkForStudentId(studentId)
    const student = await User.create({ displayName, email })
    await User.set(
      student.uid,
      getStudentObject({
        ...data,
        role: data.grade === 14 ? 'teacher' : 'student',
        displayName
      })
    )
    return { student: student.uid }
  } catch (e) {
    return Promise.reject(e)
  }
}
exports.assignLesson = async (data, me) => {
  const { teachers, lesson, module, user = me } = data
  try {
    const { lessons } = await Module.get(module)
    const activities = await Activity.getActivities({
      ...data,
      lesson: lessons.find(l => l.id === lesson),
      teachers,
      user
    }).then(getInstances)
    return Activity.createBatch(activities)
  } catch (e) {
    return Promise.reject({ error: e.message })
  }
}
exports.signInWithPassword = async ({ user, type, password: attempt }) => {
  try {
    const { passwords } = await User.get(user)
    if (attempt === passwords[type]) {
      const token = await User.getCredential(user)
      return { token }
    } else {
      return Promise.reject({ error: 'invalid_credentials' })
    }
  } catch (e) {
    Promise.reject(e)
  }
}

function generateInsecurePassword (type) {
  return {
    [`passwords.${type}`]: getRandomPassword(type)
  }
}

function getStudentObject (data) {
  const { school, email, displayName, studentId, name, role = 'student' } = data
  return {
    schools: { [school]: true },
    'nav.school': school,
    email: email || null,
    displayName,
    studentId,
    role,
    name
  }
}
