const test = require('tape')
const Ajv = require('ajv')
const { schema } = require('.')

const ajv = new Ajv({ allErrors: true })

const data = {
  displayName: 'jam',
  imageUrl: 'http://www.schoolImage.com',
  classes: {
    abc123: true
  },
  teachers: {
    abacsdf123: true
  },
  students: {
    student123: true
  }
}

test('school schema', t => {
  var valid = ajv.validate(schema, data)
  t.equal(valid, true, ajv.errors ? JSON.stringify(ajv.errors) : 'passed')
  t.end()
})
