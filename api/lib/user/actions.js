const Activity = require('../activity')
const User = require('./model')
const omit = require('@f/omit')

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
exports.assignLesson = async data => {
  const { lesson, user } = data
  const { tasks = [], id } = lesson
  return Promise.all(
    tasks.map((task, i) =>
      Activity.add(
        Object.assign({}, omit('id', task), {
          ...omit(['id', 'instance'], data),
          url: task.instance,
          active: i === 0,
          task: task.id,
          student: user,
          lesson: id
        })
      )
    )
  )
  // return User.addAssign(user, lesson.id, lesson)
}
exports.setAssignedLessonIndex = ({ user, lesson, current }) =>
  User.updateAssign(user, lesson, { current })
exports.createStudent = async props => {
  const { name, studentId } = props
  const displayName = `${name.given} ${name.family}`
  try {
    await User.checkForStudentId(studentId)
    const student = await User.create({ displayName })
    await User.set(student, getStudentObject({ ...props, displayName }))
    return { student }
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
