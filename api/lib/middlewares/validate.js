module.exports = (req, res, next) =>
  getSchema(req.methodFamily, req.method.name)
    .then(schema =>
      validate(schema, Object.assign({}, req.body, { uid: req.uid }))
    )
    .then(next)
    .catch(e => res.send({ ok: false, error: e.message, errorDetails: e }))

function getSchema (methodFamily, name) {
  return new Promise((resolve, reject) => {
    try {
      resolve(require(`../../../schema/${methodFamily}`)[name])
    } catch (e) {
      reject(new Error('no_schema'))
    }
  })
}

function validate (validator, data) {
  return new Promise((resolve, reject) => {
    const { valid, errors } = validator(data, { greedy: true })
    if (!valid) {
      return reject(errors)
    }
    return resolve()
  })
}
