var app = require('express')()
var async = require('async');
var request = require('request');
var _ = require('underscore');

app.get('/', function(req, res) {
  // get a random number
  function getPage(url){
      return function(callback){
          request(url, function(err, resp, body){
              callback(null, body);
          })
      }

  }

  async.auto({
      "step1": getPage('http://randnum.herokuapp.com'),
      "step2": ['step1', getPage('http://random-word.herokuapp.com')]
  }, function(err, results){
      if (!err){
          res.send(_.values(results).join(','));
      }else{
          console.log("ERROR: "+err);
      }

  });
})

var server = app.listen((process.env.PORT || 5000), function() {
  console.log('Running: http://%s:%s', server.address().address, server.address().port)
})