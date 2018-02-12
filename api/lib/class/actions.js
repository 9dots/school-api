const Class = require('./model')
const Module = require('../module')

exports.removeStudent = (id, user) => Class.removeUser(id, user, 'student')
exports.addStudent = (id, user) => Class.addUser(id, user, 'student')
exports.createClass = Class.create
// exports.addCourse = (id, course) => {
//   Class
// }
