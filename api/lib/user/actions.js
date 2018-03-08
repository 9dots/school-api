const integrations = require('../../../integrations')
const fetch = require('isomorphic-fetch')
const User = require('./model')

// const { tasks } = lesson
// const toCopy = getIntegrations(tasks)
// const res = await Promise.all(
//   toCopy.map(int => int.copy(int.links, students.length))
// )
// if (!res.ok) {
//   throw new Error(res.error)
// }

// async function getTaskUrls (task, num) {
//   const integration = getIntegration(task)
//   if (!integration) return task
//   const
//   const url = await integration.
//   return task
// }

// function getIntegration (task) {
//   return integrations.find(int => int.pattern.match(task.url))
// }

// function getIntegrations (tasks) {
//   return integrations
//     .filter(int => !!int.events.copy)
//     .map(int => ({
//       ...int,
//       copy: copy(int.events.copy, int.copyPerStudent),
//       links: tasks
//         .filter(t => !!int.pattern.match(t.url))
//         .map(t => ({ id: t.id, url: t.url }))
//     }))
//     .filter(int => int.links.length > 0)
// }

// function copy (url) {
//   return (links, num) =>
//     fetch('url', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         links: perStudent
//           ? Array.from(Array(num))
//             .map(() => links)
//             .reduce((acc, arr) => acc.concat(arr), [])
//           : links
//       })
//     })
//       .then(res => res.json())
//       .catch(e => console.error('error', e))
// }

exports.teacherSignUp = ({ school, teacher, ...additional }) =>
  User.update(teacher, {
    [`schools.${school}`]: 'teacher',
    ...additional
  })
exports.addToSchool = ({ school, user, role }) =>
  User.update(user, {
    [`schools.${school}`]: role
  })
exports.setNav = ({ class: cls }, me) =>
  User.update(me, {
    nav: cls
  })
exports.assignLesson = async ({ lesson, user }) =>
  User.addAssign(user, lesson.id, lesson)
exports.setAssignedLessonIndex = ({ user, lesson, current }) =>
  User.updateAssign(user, lesson, { current })
exports.createStudent = async props => {
  const { name, studentId } = props
  const displayName = `${name.given} ${name.family}`
  try {
    await User.checkForStudentId(studentId)
    const student = await User.create({ displayName })
    await User.set(student, getStudentObject({ ...props, displayName }))
    return { student }
  } catch (e) {
    return Promise.reject(e)
  }
}

function getStudentObject ({ school, email, displayName, studentId, name }) {
  return {
    schools: { [school]: 'student' },
    'nav.school': school,
    email: email || null,
    displayName,
    studentId,
    name
  }
}
