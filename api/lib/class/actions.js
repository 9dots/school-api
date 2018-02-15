const Class = require('./model')
const Module = require('../module')

exports.removeStudent = ({ class: cls, student: user }) =>
  Class.removeUser(cls, user, 'student')
exports.addStudent = ({ class: cls, student: user }) =>
  Class.addUser(cls, user, 'student')
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
