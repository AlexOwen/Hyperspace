'use strict';
exports.init = () => {

    let events = require('events');
    let bus_in = new events.EventEmitter;
    let bus_out = new events.EventEmitter;

    //players
    let players = {};
    let playerCount = 0;

    //game variables
    let level = 1;

    let screen = {
        width: 21,
        height: 11
    };

    let enemyTypes = {
        basic: {
            damage: {
                collision: 10,
                weapon: 1
            },
            speed: 1
        }
    };

    //entities
    let ship = {
        position: {
            x: 0,
            y: 2
        },
        health: {
            life: 50,
            shields: 50
        },
        damage: {
            weapons: 1
        },
        speed: 1
    };

    //enemies
    let enemies = {};
    let createEnemy = () => {
        console.log('Create enemy');
        let enemy = {
            id: (Math.random().toString(36) + '00000000000000000').slice(2, 7),
            position: {
                x: Math.floor(Math.random() * screen.height), //random position on screen
                y: screen.width + 1     //just off the screen
            },
            type: 'basic'
        };
        enemies[enemy.id] = enemy;

        setInterval(() => {
            if (enemy.position.x - 1 >= -1) {
                enemy.position.x--;
                bus_out.emit('enemy:position', {id: enemy.id, position: enemy.position});
                if (enemy.position.y === ship.position.y && enemy.position.x === ship.position.x) {
                    //emit damage
                    bus_in.emit('ship:damage', enemyTypes[enemy.type].damage.collision);
                }
            } else {
                enemies[enemy.id] = undefined;
            }
        }, (enemyTypes[enemy.type].speed + ship.speed) * 1000)

        setTimeout(() => {createEnemy();}, Math.random() * 1000 * level); //create enemy randomly every 1-10 seconds
    };

    //set up game
    bus_in.on('game:start', () => {
        level = 1;
        console.log('Start Game');
        setTimeout(() => {createEnemy();}, Math.random() * 1000 * level); //create enemy randomly every 1-10 seconds

        bus_out.emit('ship:position', ship.position);
        bus_out.emit('ship:health', ship.health);
        bus_out.emit('game:started');
    });

    bus_in.on('player:join', (playerID) => {
        players[playerID] = {
            number: playerCount++,
            ready: false
        };
// /* remove this */ bus_in.emit('game:start');
        bus_out.emit('player:joined', playerID, players[playerID].number);
    });

    bus_in.on('player:leave', (playerID) => {
        if (playerID !== undefined && players[playerID] !== undefined && players[playerID].number !== undefined) {
            let playerNumber = players[playerID].number;
            players[playerID] = undefined;

            bus_out.emit('player:left', playerID, playerNumber);
        }
    });

    bus_in.on('player:ready', (playerID, isReady) => {
        if (players[playerID] !== undefined) {
            players[playerID].ready = isReady;

            let playerStates = [];
            let gameReady = true;
            for (let player in players) {
                if (!players[player].ready) gameReady = false;
                
                playerStates.push({
                    number: players[player].number,
                    ready: players[player].ready
                });
            }
            bus_out.emit('game:ready_players', playerStates);

            if (gameReady) {
                console.log(gameReady);
                bus_in.emit('game:start');
            }
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

    bus_in.on('ship:damage', (value) => {
        if (ship.health.shields <= 0) {                 //no shields, take damage
            ship.health.life -= value;
        } else if (ship.health.shields - value >= 0) {   //shields absorb it
            ship.health.shields -= value;
        } else if (ship.health.shields - value < 0) {   //shields destroyed, take some damage
            ship.health.shields -= value;
            ship.health.life += ship.health.shields;
            ship.health.shields = 0;
        }

        bus_out.emit('ship:health', ship.health);
    });

    //engineering

    //weapons
    bus_in.on('ship:fire:weapon', () => {});

    return {
        in: bus_in,
        out: bus_out
    }
}
