module.exports = async (req, res, next) => {
  try {
    await validate(req.validator, req.body)
    next()
  } catch (e) {
    res.send({ ok: false, error: 'missing_required_field', errorDetails: e })
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
