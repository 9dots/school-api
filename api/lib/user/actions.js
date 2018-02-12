const User = require('./model')

exports.teacherSignUp = ({ school, teacher, ...additional }) =>
  User.update(teacher, {
    [`schools.${school}`]: 'teacher',
    'nav.school': school,
    ...additional
  })
exports.addToSchool = ({ school, user, role }) =>
  User.update(user, {
    [`schools.${school}`]: role,
    'nav.school': school
  })
exports.setNav = ({ school, class: cls }, me) =>
  User.update(me, {
    [`nav.class.${school}`]: cls,
    [`nav.school`]: school
  })
exports.createStudent = async props => {
  const { name, studentId } = props
  const displayName = `${name.given} ${name.family}`
  try {
    await User.checkForStudentId(studentId)
    const student = await User.checkForStudentId({ displayName })
    return User.update(student, getStudentObject(props))
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
