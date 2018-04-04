const integrations = require('../../../integrations')
const Module = require('../module')
const Class = require('./model')
const User = require('../user')

exports.removeStudent = ({ class: cls, student: user }) =>
  Class.removeUser(cls, user, 'student')
exports.addStudent = ({ class: cls, student: user }) =>
  Class.addUser(cls, user, 'student')
exports.assignLesson = async data => {
  try {
    const { class: cls, lesson } = data
    const students = await Class.getField(cls, 'students', {}).then(Object.keys)
    const teachers = await Class.getField(cls, 'teachers')
    await Promise.all(
      students.map((student, i) =>
        User.assignLesson({
          ...data,
          user: student,
          teachers
        })
      )
    )
    return Class.update(cls, {
      assignedLesson: lesson
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
exports.createClass = Class.create
