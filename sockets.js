'use strict';
exports.init = (server) => {
    let state = require('./state.js');
    let io = require('socket.io').listen(server);

    let games = {};

    io.on('connection', socket => {
	    console.log('WebSocket: A user connected');

        // joining
        socket.on('game:create', () => {
            let roomID = Math.floor(Math.random()*90000) + 10000;
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
            } catch(e) {
                console.log("game:join fail, roomID not found: " + roomID);
            }

        });

        //player to server
        socket.on('player:ready', (isReady) => {
            games[socket.room].in.emit('player:ready', socket.playerID, isReady);
        });

        socket.on('ship:move:up', () => {
            games[socket.room].in.emit('ship:move:up');
        });

        socket.on('ship:move:down', () => {
            games[socket.room].in.emit('ship:move:down');
        });

        socket.on('ship:fire', (enemyID) => {
            games[socket.room].in.emit('ship:fire', enemyID);
        });

        socket.on('ship:fire_closest', (enemyID) => {
            games[socket.room].in.emit('ship:fire_closest');
        });

        socket.on('ship:generate_power', () => {
            games[socket.room].in.emit('ship:generate_power');
        });

        socket.on('ship:move_power', (destination) => {
            games[socket.room].in.emit('ship:move_power', destination);
        });

        socket.on('ship:use_power', (amount, location) => {
            games[socket.room].in.emit('ship:use_power', amount, location);
        });

        socket.on('ship:cause_damage', (amount, location) => {
            games[socket.room].in.emit('ship:damage', amount, location);
        });

        socket.on('ship:repair', (location) => {
            games[socket.room].in.emit('ship:repair', 1, location);
        });

        socket.on('ship:get_closest', () => {
            games[socket.room].in.emit('enemies:get_closest');
        });

        socket.on('ship:get_status', () => {
            games[socket.room].in.emit('ship:get_status');
        });

        socket.on('disconnect', () => {
            if (socket.role === 'player') {
                if (socket.room !== undefined && games[socket.room] !== undefined) {
                    games[socket.room].in.emit('player:leave');
                }
            } else if (socket.role === 'host') {
                games[socket.room].in.emit('game:end', {reason: 'disconnect'});
            }
        });


        let attachHandlers = (state) => {
            // server to player

            state.out.on('ship:fired', (enemy) => {
                socket.emit('ship:fired', enemy);
            });

            state.out.on('ship:status', (ship) => {
                socket.emit('ship:status', ship);
            });

            state.out.on('enemy:position', (enemy) => {
                socket.emit('enemy:position', enemy);
            });

            state.out.on('enemy:closest', (enemyList) => {
                socket.emit('enemy:closest', enemyList);
            });

            state.out.on('player:joined', (playerID, playerNumber) => {
                socket.emit('player:joined', playerNumber);
            });

            state.out.on('player:left', (playerID, playerNumber) => {
                socket.emit('player:left', playerNumber);
            });

            state.out.on('game:ready_players', (playerStates) => {
                socket.emit('game:ready_players', playerStates);
            });

            state.out.on('game:started', (playerStates) => {
                socket.emit('game:started');
            });

            state.out.on('game:ended', (details) => {
                socket.emit('game:ended', details);
            });
        };
    });
};
