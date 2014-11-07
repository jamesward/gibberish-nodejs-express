var app = require('express')(),
    async = require('async'),
    cpuCount = require("os").cpus().length,
    request = require('request'),
    http = require('http'),
    cluster = require('cluster');

app.server = http.createServer(app);

if (cluster.isMaster) {
    for (var i = 0; i < cpuCount; i += 1) {
        console.log('starting worker thread #' + (i + 1));
        cluster.fork();
    }

    cluster.on('exit', function (worker) {
        console.log(worker.id + " died! Restarting...");
        cluster.fork();
    })

} else {

    app.get('/', function (req, res) {

        function getPage(url) {
            return function (callback) {
                request(url, function (err, resp, body) {
                    callback(null, body);
                })
            }
        }

        function iterator(x, cb) {
            getPage('http://random-word.herokuapp.com')(function (err, word) {
                cb(null, word)
            });
        }

        function getWords(count, callback) {
            var arr = Array.apply(null, new Array(parseInt(count)));
            async.map(arr, iterator, function(err, result){
                callback(null, result);
            });
        }

        var tasks = [];
        tasks.push(getPage('http://randnum.herokuapp.com'));
        tasks.push(getWords);

        async.waterfall(tasks, function (err, results) {
            if (!err) {
                res.send(results.join(" "));
            } else {
                console.log("ERROR: " + err);
            }

        });
    });

    app.server.listen((process.env.PORT || 5000), function () {
        console.log('Running: http://%s:%s', this.address().address, this.address().port)
    });
}