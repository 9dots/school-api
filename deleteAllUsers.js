const admin = require('firebase-admin')
const getServiceAccount = require('./getServiceAccount')
const cert = getServiceAccount('production')
const sleep = require('@f/sleep')

admin.initializeApp({
  credential: admin.credential.cert(cert)
})

const usersCol = admin.firestore().collection('users')

const keepUsers = [
  'SxO05KbXVAOh2JCYt0QCPH4dJ1K2',
  'jLUT5t5EyQVtNtDjcdKrYdZR5Vk1'
]

const localKeepUsers = [
  '6DgXDNV2xQVrknL28eT3FnS8anC2',
  'cKgLuM1s6qStdVxVooO8qv8lego1'
]

async function deleteUsersCollection () {
  const users = await usersCol.get().then(snap => snap.docs.map(doc => doc.id))
  return Promise.all(
    users.map(
      user =>
        keepUsers.indexOf(user) === -1
          ? usersCol.doc(user).delete()
          : Promise.resolve()
    )
  )
}

// async function deleteAllUsers () {
//   try {
//     const { users } = await admin.auth().listUsers(1000)
//     return Promise.all(
//       users.map(
//         (user, i) =>
//           keepUsers.indexOf(user.uid) === -1
//             ? sleep(i * 150).then(() =>
//               admin
//                 .auth()
//                 .deleteUser(user.uid)
//                 .then(() => usersCol.doc(user.uid).delete())
//             )
//             : Promise.resolve()
//       )
//     )
//   } catch (e) {
//     console.error(e)
//   }
// }
deleteUsersCollection().then(() => console.log('done'))
// deleteAllUsers().then(() => console.log('done'))

// function getServiceAccount () {
//   try {
//     return require('./secret.json')
//   } catch (e) {
//     return {
//       projectId: process.env.PROJECT_ID,
//       clientEmail: process.env.CLIENT_EMAIL,
//       privateKey: process.env.SECRET_KEY.replace(/\\n/g, '\n')
//     }
//   }
// }
