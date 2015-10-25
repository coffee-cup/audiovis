var express     = require('express');
var serveStatic = require('serve-static');
var app         = express();

var PORT        = 7000;

app.use(serveStatic(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile('public/index.html', {root: __dirname})
});

var server = app.listen(PORT, function() {
  var port = server.address().port;

  console.log('magic happens on port ' + port);
});
