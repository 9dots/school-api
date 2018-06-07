const { firestore } = require('../middlewares/authenticate')
const admin = require('firebase-admin')

const usernamesRef = firestore.collection('usernames')

exports.create = create

exports.getUniqueUsername = async (username, set) => {
  const { prefix, suffix } = getParts(username)
  const num = parseInt(suffix, 10) || 0
  const doc = usernamesRef.doc(prefix)

  let newName = username.toLowerCase()

  return firestore.runTransaction(t => {
    return t.get(doc).then(async d => {
      const names = d.data()
      if (d.exists && names[newName]) {
        for (let i = num; names[newName]; i++) {
          newName = prefix + (num + i)
        }
      }
      if (set) await create(newName)
      return newName
    })
  })
}

async function create (username, prevName) {
  const { prefix } = getParts(username)
  const data = { [username.toLowerCase()]: true }
  if (prevName) data[prevName] = admin.firestore.FieldValue.delete()
  usernamesRef.doc(prefix).set(data, { merge: true })
}

function getParts (username) {
  const name = sanitize(username)
  const match = name.match(/\d+$/)
  const isMatch = match && match.index > 0
  return {
    prefix: isMatch ? name.slice(0, match.index) : name,
    suffix: isMatch ? parseInt(match[0], 10) : undefined
  }
}

function sanitize (username) {
  const i = username.lastIndexOf('@')

  // Remove emails and invalid characters
  return username
    .slice(0, i > -1 ? i : username.length)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
}
