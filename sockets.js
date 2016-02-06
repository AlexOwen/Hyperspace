'use strict';
exports.init = (server) => {
    let state = require('./state.js');
    let io = require('socket.io').listen(server);

    let games = {};

    io.on('connection', socket => {
	    console.log('WebSocket: A user connected');

        // joining
        socket.on('game:create', () => {
            console.log('game:create');
            let roomID = (Math.random().toString(36) + '00000000000000000').slice(2, 7);
            socket.join('roomID');
            socket.room = roomID;
            socket.role = 'host';
            games[roomID] = state.init();
            attachHandlers(games[roomID]);
            socket.emit('game:created', roomID);
        });

        socket.on('game:join', (roomID) => {
            let playerID = (Math.random().toString(36) + '00000000000000000').slice(2, 7);
            console.log('game:join');
            socket.join('roomID');
            socket.room = roomID;
            socket.role = 'player';
            socket.playerID = playerID;
            socket.emit('game:joined');
        });

        /*
        state.out.on('game:end', (roomID) => {

        });*/

        //player to server
        socket.on('ship:move:up', () => {
            console.log('ship up');
            games[socket.room].in.emit('ship:move:up');
        });

        socket.on('ship:move:down', () => {
            console.log('ship down');
            games[socket.room].in.emit('ship:move:down');
        });

        let attachHandlers = (state) => {
            // server to player
            state.out.on('ship:position', (position) => {
                if (socket.role === 'host') {
                    socket.emit('ship:position', position);
                }
            });
        };
    });
};
