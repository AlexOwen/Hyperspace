'use strict';

let express = require('express');
global.app = express();
let events = require('events');
let sockets = require('./sockets.js');

global.bus_in = events.EventEmitter;
global.bus_out = events.EventEmitter;

app.get('/', function (req, res) {
  res.send('Hello World!');
  //Dan's shit here
});

app.listen(3000, function () {

});
