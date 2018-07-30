// const getInstances = require('../utils/getInstances')
const { getRandomPassword } = require('./utils')
// const Activity = require('../activity')
const Username = require('../username')
// const Module = require('../module')
const Auth = require('../auth')
const User = require('./model')

exports.get = User.get
exports.getRef = User.getRef
exports.teacherSignUp = async ({ school, teacher, email, ...additional }) => {
  const tempName = createUsername(additional.name)
  const username = await Username.getUniqueUsername(email || tempName, true)
  return User.update(teacher, {
    [`schools.${school}`]: true,
    role: 'teacher',
    username,
    ...additional
  })
}
exports.addToSchool = addToSchool
exports.setNav = ({ class: cls }, me) =>
  User.update(me, {
    nav: cls
  })

exports.setTermsVersion = ({ version }, me) =>
  User.update(me, {
    termsVersion: version
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
  const { name } = rest

  update.displayName = `${name.given} ${name.family}`
  update.username = update.username.toLowerCase()

  try {
    await User.checkForUsername(update.username, id)
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
          e => (e.error === 'email_in_use' ? e.student : { error: e.error })
        )
    )
  )
  return { add: res }
}
// exports.assignLesson = async (data, me) => {
//   const { teachers, lesson, module, user = me } = data
//   try {
//     const teacher = Object.keys(teachers)[0]
//     const { tokens } = await Auth.getAccessToken(null, teacher)
//     const { lessons } = await Module.get(module)
//     const activities = await Activity.getActivities({
//       ...data,
//       lesson: lessons.find(l => l.id === lesson),
//       teachers,
//       user
//     }).then(activities => getInstances(activities, tokens))
//     return Activity.createBatch(activities)
//   } catch (e) {
//     return Promise.reject({ error: e.message })
//   }
// }
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

function addToSchool ({ school, user }) {
  return User.update(user, {
    [`schools.${school}`]: true
  })
}

async function createStudent (data) {
  const { name, email, school } = data
  const displayName = `${name.given} ${name.family}`
  const tempName = createUsername(name)
  try {
    const student = await User.create({ displayName, email })
    const username = await Username.getUniqueUsername(tempName, true)

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
    if (e.error === 'email_in_use') {
      await addToSchool({ school, user: e.student })
      return { student: e.student }
    }
    return Promise.reject(e)
  }
}

function generateInsecurePassword (type) {
  return {
    [`passwords.${type}`]: getRandomPassword(type)
  }
}

function getStudentObject (data) {
  const { role = 'student', displayName, username, school, email, name } = data
  return {
    schools: { [school]: true },
    'nav.school': school,
    email: email || null,
    displayName,
    username,
    role,
    name
  }
}

function createUsername (name) {
  return name.given.charAt(0) + name.family.substring(0, 5)
}
