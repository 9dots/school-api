const Class = require('./model')

exports.removeStudent = (id, user) => Class.removeUser(id, user, 'student')
exports.addStudent = (id, user) => Class.addUser(id, user, 'student')
exports.create = (id, data) => Class.create(id, data)
