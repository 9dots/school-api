module.exports = async (req, res, next) => {
  try {
    await validate(req.validator, req.body)
    next()
  } catch (e) {
    console.log('error', e)
    res.send({
      ok: false,
      error: 'validation_error',
      errorDetails: e.message || e
    })
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
