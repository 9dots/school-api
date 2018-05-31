const getInstances = require('../utils/getInstances')
const { getRandomPassword } = require('./utils')
const Activity = require('../activity')
const Module = require('../module')
const User = require('./model')

exports.get = User.get
exports.getRef = User.getRef
exports.teacherSignUp = async ({ school, teacher, email, ...additional }) => {
  const username = await getUniqueUsername(email || additional.name.given)
  return User.update(teacher, {
    lowerCaseUsername: username.toLowerCase(),
    [`schools.${school}`]: true,
    role: 'teacher',
    username,
    ...additional
  })
}
exports.addToSchool = ({ school, user }) =>
  User.update(user, {
    [`schools.${school}`]: true
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
exports.editUser = async ({ id, ...rest }) => {
  const update = rest
  const { name, studentId } = rest

  update.displayName = `${name.given} ${name.family}`
  update.lowerCaseUsername = update.username.toLowerCase()

  if (studentId) {
    update.studentId = studentId
  }

  try {
    const promises = [User.checkForUsername(update.lowerCaseUsername, id)]
    if (update.studentId) {
      promises.push(User.checkForStudentId(update.studentId, id))
    }
    await Promise.all(promises)
    const user = await User.edit(id, update)
    return { user: user.id }
  } catch (e) {
    return Promise.reject(e)
  }
}

exports.createStudent = createStudent
exports.createStudents = async data => {
  const res = await Promise.all(
    data.map((student, i) =>
      createStudent(student)
        .then(res => res.student)
        .catch(
          e =>
            e.error === 'studentId_taken' || e.error === 'email_in_use'
              ? e.student
              : { error: e.error }
        )
    )
  )

  return { add: res }
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

async function createStudent (data) {
  const { name, studentId, email } = data
  const displayName = `${name.given} ${name.family}`
  try {
    await User.checkForStudentId(studentId)
    const student = await User.create({ displayName, email })
    const username = await getUniqueUsername(email || name.given)
    await User.set(
      student.uid,
      getStudentObject({
        ...data,
        username,
        role: data.grade === 14 ? 'teacher' : 'student',
        displayName
      })
    )
    return { student: student.uid }
  } catch (e) {
    return Promise.reject(e)
  }
}

function generateInsecurePassword (type) {
  return {
    [`passwords.${type}`]: getRandomPassword(type)
  }
}

function getStudentObject (data) {
  const {
    role = 'student',
    displayName,
    studentId,
    username,
    school,
    email,
    name
  } = data
  return {
    lowerCaseUsername: username.toLowerCase(),
    schools: { [school]: true },
    'nav.school': school,
    email: email || null,
    displayName,
    studentId,
    username,
    role,
    name
  }
}

async function getUniqueUsername (name) {
  const i = name.lastIndexOf('@')
  let newName = name
    .slice(0, i > -1 ? i : name.length)
    .replace(/[^a-zA-Z0-9]/g, '')

  try {
    await User.checkForUsername(newName.toLowerCase())
    return newName
  } catch (e) {
    const match = name.match(/\d+$/)
    const nextName = match
      ? name.slice(0, match.index) + (parseInt(match[0], 10) + 1)
      : name + 1
    return getUniqueUsername(nextName.toString())
  }
}
