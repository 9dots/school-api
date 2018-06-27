const Username = require('../api/lib/username')
const admin = require('firebase-admin')
const omit = require('@f/omit')

const firestore = admin.firestore()
const usersRef = firestore.collection('users')

async function migrateUsernames () {
  const users = await getUsers()
  const transformed = await Promise.all(users.map(transformUsers))
  const userPromises = transformed.map(user => {
    if (!user.id) console.log(user, user.id)
    usersRef.doc(user.id).set(omit('id', user))
  })
  const namePromises = transformed.map(user => Username.create(user.username))
  return Promise.all(userPromises.concat(namePromises))
}

migrateUsernames()
  .then(() => console.log('done'))
  .catch(console.error)

function getUsers () {
  return usersRef
    .get()
    .then(qSnap => qSnap.docs.map(d => ({ ...d.data(), id: d.id })))
}

async function transformUsers (user) {
  delete user.lowerCaseUsername
  let newName = user.username
  if (!newName) {
    newName = await Username.getUniqueUsername(createUsername(user.name), true)
  }
  return {
    ...user,
    username: newName.toLowerCase()
  }
}

function createUsername (name) {
  return name.given.charAt(0) + name.family.substring(0, 5)
}
