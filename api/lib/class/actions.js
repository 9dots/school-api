const Class = require('./model')
const Course = require('../course')

exports.removeStudent = ({ class: cls, student: user }) =>
  Class.removeUser(cls, user, 'student')
exports.addStudent = ({ class: cls, student: user }) =>
  Class.addUser(cls, user, 'student')
exports.addCourse = async ({ class: cls, module: mod }) => {
  try {
    const course = await Course.createFromModule({ module: mod, class: cls })
    return Class.update(cls, {
      [`courses.${course}`]: {
        active: false,
        course
      }
    })
  } catch (e) {
    return Promise.reject(e)
  }
}
exports.createClass = Class.create
