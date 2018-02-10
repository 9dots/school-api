module.exports = async (req, res, next) => {
  try {
    await validate(req.validator, { ...req.body, uid: req.uid })
    next()
  } catch (e) {
    res.send({ ok: false, error: e.message, errorDetails: e })
  }
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
