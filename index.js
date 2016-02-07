'use strict';

let express = require('express');
var app = express();
var port = process.env.PORT || 3000
var server = app.listen(port);

console.log("server running on port : " + port)

// app.use(express.static('debug'));
app.use(express.static('public'));
require('./sockets.js').init(server);
