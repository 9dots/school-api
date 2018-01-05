var domready = require('domready')
var shoe = require('shoe')
var dnode = require('dnode')

domready(function () {
  var result = document.getElementById('result')
  var stream = shoe('http://localhost:9999/dnode')

  var d = dnode()
  d.on('remote', function (remote) {
    remote.transform('beep', function (s) {
      result.textContent = 'beep => ' + s
    })
  })
  d.pipe(stream).pipe(d)
})
