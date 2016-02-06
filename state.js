'use strict';
exports.init = () => {

    let events = require('events');
    let bus_in = new events.EventEmitter;
    let bus_out = new events.EventEmitter;

    //players
    let players = {};
    let playerCount = 0;

    //game variables
    let level = 0;

    let screen = {
        width: 7,
        height: 5
    };

    //entities
    let ship = {
        position: {
            x: 3,
            y: 1
        },
        life: 10
    };

    //enemies
    let enemies = {};
    let createEnemy = () => {
        let enemy = {
            id: (Math.random().toString(36) + '00000000000000000').slice(2, 7),
            position: {
                x: Math.floor(Math.random() * screen.height), //random position on screen
                y: screen.width + 1     //just off the screen
            },
            damage: 1,
            speed: 1
        };
        enemies[enemy.id] = enemy;

        setInterval(() => {
            if (enemy.position - 1 >= -1) {
                enemy.position--;
                if (enemy.position.y === ship.position.y && enemy.position.x === ship.position.x) {
                    //emit damage
                    bus_out.emit('ship:damage', enemy.damage);
                }
            } else {
                //destroy
            }
        }, enemy.speed * 1000)

        setTimeout(createEnemy(), Math.random() * 10000); //create enemy randomly every 1-10 seconds
    };

    //set up game
    bus_in.on('game:start', () => {
        level = 1;
        setTimeout(createEnemy(), Math.random() * 10000); //create enemy randomly every 1-10 seconds

        bus_out.emit('ship:position:y', ship.position.y);
    });

    bus_in.on('player:join', (playerID) => {
        players[playerID] = {};
        players[playerID].number = playerCount++;

        bus_out.emit('player:joined', playerID, players[playerID].number);
    });

    bus_in.on('player:leave', (playerID) => {
        let playerNumber = players[playerID].number;
        players[playerID] = undefined;

        bus_out.emit('player:left', playerID, playerNumber);
    });

    bus_in.on('player:ready', (playerID, isReady) => {
        if (players[playerID] !== undefined) {
            if (isReady) {
                players[playerID].ready = true;
            } else {
                players[playerID].ready = false;
            }

            let playerStates = [];
            for (player in players) {
                playerStates.push({
                    number: player.number,
                    ready: player.ready
                });
            }

            bus_out.emit('game:ready_players', playerStates);


        } else {
            console.log('Error: player doesn\'t exist');
        }
    });

    //in game actions

    //bridge
    bus_in.on('ship:move:up', () => {
        if (ship.position.y >= 1) {
            ship.position.y = ship.position.y - 1;
            bus_out.emit('ship:position:y', ship.position.y);
        }
        console.log('ship position: ' + ship.position.y);
    });

    bus_in.on('ship:move:down', () => {
        if (ship.position.y <= screen.height - 2) {
            ship.position.y = ship.position.y + 1;
            bus_out.emit('ship:position:y', ship.position.y);
        }
        console.log('ship position: ' + ship.position.y);
    });

    //engineering

    //weapons
    bus_in.on('ship:fire:weapon', () => {});

    return {
        in: bus_in,
        out: bus_out
    }
}
