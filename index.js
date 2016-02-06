'use strict';

let express = require('express');
var app = express();
var server = app.listen(3000);

app.use(express.static('debug'));

/*app.get('/', function (req, res) {
  res.send('Hello World!');
  //Dan's shit here
});*/


require('./sockets.js').init(server);
