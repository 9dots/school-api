const fs = require('fs')
const setProp = require('@f/set-prop')
const columns = [
  'phone',
  'name',
  'street',
  'city',
  'state',
  'zip',
  'zip4',
  'lat',
  'lng'
]

const schools = fs.readFileSync('./schools.csv', 'utf-8')
fs.writeFileSync(
  'schools.json',
  JSON.stringify(
    schools.split('\n').map(school =>
      school.split(',').reduce((acc, val, i) => {
        if (columns[i] === 'lat') {
          return setProp('_geoloc.lat', acc, val)
        }
        if (columns[i] === 'lng') {
          return setProp('_geoloc.lng', acc, val)
        }
        return { ...acc, [columns[i]]: val }
      }, {})
    )
  )
)
