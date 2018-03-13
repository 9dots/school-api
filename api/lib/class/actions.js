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
    const taskP = lesson.tasks.map(task => {
      const int = integrations.find(int => int.pattern.match(task.url))
      return {
        ...task,
        instance: int
          ? int.copyPerStudent
            ? () => int.events.copy(task.url)
            : int.events.copy(task.url).then(res => res.link)
          : task.url
      }
    })
    const withNewTasks = await Promise.all(
      students.map(async student => {
        const tasks = await Promise.all(
          taskP.map(async t => ({
            ...t,
            instance:
              typeof t.instance === 'function'
                ? await t.instance().then(res => res.link)
                : t.instance
          }))
        )
        return {
          ...lesson,
          tasks
        }
      })
    )
    console.log(students)
    await Promise.all(
      students.map((student, i) =>
        User.assignLesson({
          ...data,
          lesson: withNewTasks[i],
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
