const Activity = require('../activity')
const Module = require('../module')
const Class = require('./model')

exports.removeStudent = ({ class: cls, student: user }) =>
  Class.removeUser(cls, user, 'student')
exports.addStudent = ({ class: cls, student: user }) =>
  Class.addUser(cls, user, 'student')
exports.removeTeacher = ({ class: cls, teacher }, me) =>
  Class.removeUser(cls, teacher || me, 'teacher')
exports.addTeacher = ({ class: cls, teacher }, me) =>
  Class.addUser(cls, teacher || me, 'teacher')
exports.assignLesson = async data => {
  try {
    const { class: cls, lesson, module } = data
    const { students = {}, teachers } = await Class.get(cls)
    const { lessons } = await Module.get(module)
    const lessonData = lessons.find(l => l.id === lesson)
    const activities = await Promise.all(
      Object.keys(students).map((student, i) =>
        Activity.getActivities({
          ...data,
          lesson: lessonData,
          user: student,
          teachers
        })
      )
    )
    await Activity.createBatch(
      activities.reduce((acc, act) => acc.concat(...act), [])
    )
    return Class.update(cls, {
      assignedLesson: lessonData
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
exports.get = Class.get
