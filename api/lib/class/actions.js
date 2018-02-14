const Class = require('./model')
const Module = require('../module')

exports.removeStudent = ({ class: cls, student: user }) =>
  Class.removeUser(cls, user, 'student')
exports.addStudent = ({ class: cls, student: user }) =>
  Class.addUser(cls, user, 'student')
exports.addCourse = async ({ class: cls, module: course }) => {
  try {
    const [mod] = await Promise.all([
      Module.get(course),
      Module.incrementAssigns(course)
    ])
    const copiedCourse = {
      ...mod,
      forkedFrom: { course: course, version: mod.version || 0 }
    }
    return Class.update(cls, {
      [`courses.${course}`]: copiedCourse
    })
  } catch (e) {
    return Promise.reject(e)
  }
}
exports.createClass = Class.create
