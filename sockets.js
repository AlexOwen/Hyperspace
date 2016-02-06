'use strict';
exports.init = (server) => {
    let state = require('./state.js');
    let io = require('socket.io').listen(server);

    let games = {};

    io.on('connection', socket => {
	    console.log('WebSocket: A user connected');

        // joining
        socket.on('game:create', () => {
            let roomID = (Math.random().toString(36) + '00000000000000000').slice(2, 7);
            socket.join('roomID');
            socket.room = roomID;
            socket.role = 'host';
            games[roomID] = state.init();
            attachHandlers(games[roomID]);
            socket.emit('game:created', roomID);
            console.log('game:create ' + roomID);
        });

        socket.on('game:join', (roomID) => {
            let playerID = (Math.random().toString(36) + '00000000000000000').slice(2, 7);
            socket.join('roomID');
            socket.room = roomID;
            socket.role = 'player';
            socket.playerID = playerID;
            //return player number
            try {
                attachHandlers(games[roomID]);
                games[socket.room].in.emit('player:join', playerID);

                socket.emit('game:joined', roomID);
                console.log('game:joined ' + roomID);
            } catch(e) {
                console.log("player:join fail, roomID not found: " + roomID);
            }

        });

        /*
        state.out.on('game:end', (roomID) => {

        });*/

        //player to server
        socket.on('player:ready', (isReady) => {
            games[socket.room].in.emit('player:ready', socket.playerID, isReady);
        });

        socket.on('ship:move:up', () => {
            console.log('ship up');
            games[socket.room].in.emit('ship:move:up');
        });

        socket.on('ship:move:down', () => {
            console.log('ship down');
            games[socket.room].in.emit('ship:move:down');
        });

        socket.on('disconnect', () => {
            if (socket.role === 'player') {
                if (socket.room !== undefined && games[socket.room] !== undefined) {
                    games[socket.room].in.emit('player:leave');
                }
            } else if (socket.role === 'host') {
                games[socket.room].in.emit('game:end');
            }
        });


        let attachHandlers = (state) => {
            // server to player
            state.out.on('ship:position', (position) => {
                console.log('ship:position out');
                socket.emit('ship:position', position);
            });

            state.out.on('player:joined', (playerID, playerNumber) => {
                socket.emit('player:joined', playerNumber);
                console.log('player:joined ' + playerNumber);
            });

            state.out.on('player:left', (playerID, playerNumber) => {
                socket.emit('player:left', playerNumber);
                console.log('player:left ' + playerNumber);
            });

            state.out.on('game:ready_players', (playerStates) => {
                socket.emit('game:ready_players', playerStates);
                console.log('game:ready_players ' + playerStates);
            });
        };
    });
};
