'use strict';
exports.init = () => {
    let state = require('./state');

    let games = {};
    let players = {}; //ship, bridge, engineering, ...


    let io = require('socket.io');
    io.listen(global.app).on('connection', socket => {
	    log.debug('WebSocket: A user connected');

        // joining
        socket.on('game:create', () => {
            let roomID = (Math.random().toString(36) + '00000000000000000').slice(2, 7);
            socket.join('roomID');
            games[roomID] = {};
            games[roomID]['players'] = {};
            games[roomID].players.host = {};
            games[roomID].players.host.socket = socket;
            state.init();
            socket.emit('game:created', roomID);
        });

        socket.on('game:join', (roomID) => {
            socket.join('roomID');
            games[roomID].players.p1 = {};
            games[roomID].players.p1.socket = socket;
            games[roomID].players.p1.position = 'bridge';
            socket.emit('player:location', 'bridge');
        });

        //player to server
        socket.on('ship:move:up', () => {
            bus_in.emit('ship:move:up');
        });

        socket.on('ship:move:down', () => {
            bus_in.emit('ship:move:down');
        });

        // server to player
        bus_out.on('ship:position', (position) => {
            socket.emit('ship:position', position);
        });
    });
};
