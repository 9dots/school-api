const Activity = require('../activity')
const Module = require('../module')
const Class = require('../class')
const User = require('./model')

exports.teacherSignUp = ({ school, teacher, ...additional }) =>
  User.update(teacher, {
    [`schools.${school}`]: 'teacher',
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
exports.createStudent = async data => {
  const { name, studentId, email } = data
  const displayName = `${name.given} ${name.family}`
  try {
    await User.checkForStudentId(studentId)
    const student = await User.create({ displayName, email })
    await User.set(student.uid, getStudentObject({ ...data, displayName }))
    return { student: student.uid }
  } catch (e) {
    return Promise.reject(e)
  }
}
exports.assignLesson = async (data, me) => {
  const { class: cls, lesson, module, user = me } = data
  try {
    const { teachers } = await Class.get(cls)
    const { lessons } = await Module.get(module)
    const activities = await Activity.getActivities({
      ...data,
      lesson: lessons.find(l => l.id === lesson),
      teachers,
      user
    })
    return Activity.createBatch(activities)
  } catch (e) {
    return Promise.reject(e)
  }
}

function getStudentObject ({ school, email, displayName, studentId, name }) {
  return {
    schools: { [school]: 'student' },
    'nav.school': school,
    email: email || null,
    displayName,
    studentId,
    name
  }
}
