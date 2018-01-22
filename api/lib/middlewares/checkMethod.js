module.exports = (req, res, next) => {
  return methodFamilyCheck(req.params.method.split('.'))
    .then(method => {
      req.method = method
      req.methodFamily = req.params.method.split('.')[0]
      next()
    })
    .catch(e => res.send({ ok: false, error: e.message }))
}

function methodFamilyCheck ([methodFamilyName, method]) {
  return getMethodFamily(methodFamilyName).then(methodFamily =>
    getMethod(method, methodFamily)
  )
}

function getMethodFamily (name) {
  return new Promise((resolve, reject) => {
    try {
      resolve(require(`../${name}`))
    } catch (e) {
      console.error(e)
      reject(new Error('method_family_not_found'))
    }
  })
}

function getMethod (name, api) {
  return new Promise((resolve, reject) => {
    api[name] ? resolve(api[name]) : reject(new Error('method_not_found'))
  })
}
