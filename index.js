'use strict';

let express = require('express');
var app = express();
var server = app.listen(3000);
app.use(express.static('public'));
require('./sockets.js').init(server);
