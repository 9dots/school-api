const arraySet = require('./arraySet')
const splice = require('@f/splice')

module.exports = (lessons, source, type, destination, id) => {
  if (type === 'lesson') {
    return reorder(lessons, source.index, destination.index)
  }
  return handleDrop(lessons, source, destination, id)
}

function handleDrop (arr, source, destination, id) {
  const next = arr.find(item => item.id === destination.droppableId)
  const prev = arr.find(item => item.id === source.droppableId)
  if (source.droppableId === destination.droppableId) {
    return arraySet(arr, arr.indexOf(next), {
      ...next,
      tasks: reorder(next.tasks, source.index, destination.index)
    })
  }
  const target = prev.tasks.find(t => t.id === id)
  return arr.map(lesson => {
    if (lesson.id === destination.droppableId) {
      return {
        ...lesson,
        tasks: splice(lesson.tasks, destination.index, 0, target)
      }
    } else if (lesson.id === source.droppableId) {
      return {
        ...lesson,
        tasks: splice(lesson.tasks, source.index, 1)
      }
    }
    return lesson
  })
}

function reorder (list, startIndex, endIndex) {
  const result = [...list]
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}
