const Activity = require('../activity')
const Module = require('../module')
const Class = require('./model')
const omit = require('@f/omit')

exports.removeStudent = ({ class: cls, student: user }) =>
  Class.removeUser(cls, user, 'student')
exports.addStudent = ({ class: cls, student: user }) =>
  Class.addUser(cls, user, 'student')
exports.assignLesson = async data => {
  try {
    const { class: cls, lesson } = data
    const students = await Class.getField(cls, 'students', {}).then(Object.keys)
    const teachers = await Class.getField(cls, 'teachers')
    const activities = await Promise.all(
      students.map((student, i) =>
        getActivities({
          ...data,
          user: student,
          teachers
        })
      )
    )
    await Activity.createBatch(
      activities.reduce((acc, act) => acc.concat(...act), [])
    )
    return Class.update(cls, {
      assignedLesson: lesson
    })
  } catch (e) {
    console.log('error', e)
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

function getActivities (data) {
  const { lesson, user } = data
  const { tasks = [], id } = lesson
  return Promise.all(
    tasks.map((task, i) =>
      Activity.getActivity(
        Object.assign({}, omit(['id', 'instance', 'user'], task), {
          ...omit(['id'], data),
          active: i === 0,
          task: task.id,
          student: user,
          lesson: id
        })
      )
    )
  ).then(activities => activities.filter(act => !!act))
}
