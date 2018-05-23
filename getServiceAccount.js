module.exports = function getServiceAccount (env) {
  if (env) {
    if (env === 'production') return getProd()
    return getDev()
  }
  return process.env.NODE_ENV === 'production' ? getProd() : getDev()
}

function getDev () {
  return require('./devSecrets.json')
}

function getProd () {
  try {
    return require('./secret.json')
  } catch (e) {
    return {
      projectId: process.env.PROJECT_ID,
      clientEmail: process.env.CLIENT_EMAIL,
      privateKey: process.env.SECRET_KEY.replace(/\\n/g, '\n')
    }
  }
}
