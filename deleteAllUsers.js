const admin = require('firebase-admin')
const getServiceAccount = require('./getServiceAccount')
const cert = getServiceAccount('dev')
const sleep = require('@f/sleep')

const firebase = admin.initializeApp({
  credential: admin.credential.cert(cert)
})

async function deleteAllUsers () {
  try {
    const { users } = await admin.auth().listUsers(1000)
    return Promise.all(
      users.map((user, i) =>
        sleep(i * 100).then(() => admin.auth().deleteUser(user.uid))
      )
    )
  } catch (e) {
    console.error(e)
  }
}

deleteAllUsers().then(() => console.log('done'))

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
