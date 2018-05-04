const schema = require('school-schema')

module.exports = (req, res, next) => {
  const [methodFamily, method] = req.params.method.split('.')
  try {
    req.methodFamily = methodFamily
    req.methodName = method
    req.validator = schema[methodFamily][method]
    req.action = require(`../${methodFamily}`)[method]
    if (!req.action) {
      throw new Error('method_not_found')
    }
    next()
  } catch (e) {
    console.log('error', e)
    res.send({ ok: false, error: 'method_not_found' })
  }
}
