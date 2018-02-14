const Class = require('./model')
const Course = require('../course')

exports.removeStudent = ({ class: cls, student: user }) =>
  Class.removeUser(cls, user, 'student')
exports.addStudent = ({ class: cls, student: user }) =>
  Class.addUser(cls, user, 'student')
exports.addCourse = async ({ class: cls, module: mod }) => {
  try {
    const { course } = await Course.createCopy({ module: mod, class: cls })
    return Class.update(cls, {
      [`courses.${course}.active`]: false,
      [`courses.${course}.course`]: course
    })
  } catch (e) {
    return Promise.reject(e)
  }
}
exports.createClass = Class.create
