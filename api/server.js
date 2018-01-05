var http = require('http')
var shoe = require('shoe')
var path = require('path')
var ecstatic = require('ecstatic')(path.join(__dirname, '..', 'dist'))
var dnode = require('dnode')

console.log(path.join(__dirname, '..', 'dist'))

var server = http.createServer(ecstatic)
server.listen(9999)

var sock = shoe(function (stream) {
  var d = dnode({
    transform: function (s, cb) {
      var res = s.replace(/[aeiou]{2,}/, 'oo').toUpperCase()
      cb(res)
    }
  })
  d.pipe(stream).pipe(d)
})
sock.install(server, '/dnode')
