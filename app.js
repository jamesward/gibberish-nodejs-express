var app = require('express')()
var Q = require('q')
var request = Q.denodeify(require('request'))

app.get('/', function(req, res) {
  // get a random number
  request('http://randnum.herokuapp.com').then(function(response) {
    return parseInt(response[0].body);
  }).then(function(numWords) {
    // request random words
    var requests = Array.apply(null, new Array(numWords)).map(function() {
      return request('http://random-word.herokuapp.com')
    })

    return Q.all(requests)
  }).then(function(responses) {
    // return the random words in the response
    var words = responses.map(function(response) {
      return response[0].body
    })

    res.send(words.join(" "))
  })
})

var server = app.listen((process.env.PORT || 5000), function() {
  console.log('Running: http://%s:%s', server.address().address, server.address().port)
})