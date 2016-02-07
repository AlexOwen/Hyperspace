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
        width: 20,
        height: 7
    };

    let enemyTypes = {
        asteroid: {
            name: 'asteroid',
            health: 1,
            damage: {
                collision: 10
            },
            speed: 1,
            creationRate: 4
        },
        basic: {
            name: 'basic',
            health: 1,
            damage: {
                collision: 10
            },
            gun: {
                rateOfFire: 0.5,
                projectile: 'projectile'
            },
            speed: 1,
            creationRate: 3
        },
        projectile: {
            name: 'projectile',
            health: 100000,
            damage: {
                collision: 1
            },
            speed: 10
        }
    };

    //entities
    let ship = {
        position: {
            x: 0,
            y: 3
        },
        health: {
            hull: 50,
            main_shields: 10,
            shields: 10,
            engineering: 10,
            weapons: 10,
            bridge: 10
        },
        max_health: {
            hull: 50,
            main_shields: 50,
            shields: 10,
            engineering: 10,
            weapons: 10,
            bridge: 10
        },
        power: {
            bridge: 10,
            weapons: 10,
            shields: 10,
            engineering: 10
        },
        damage: {
            weapons: 1
        },
        speed: 1
    };

    //enemies
    let enemies = {};
    let createEnemy = (details) => {
        if ((details.isProjectile && details.parent !== undefined) || !details.isProjectile) {
            if (ship.health.hull > 0) {

                let x = 0, y = 0;
                if (details.startPos === undefined) {
                    if (details.isProjectile) {
                        x = details.parent.position.x - 1;
                        y = details.parent.position.y;
                    } else {
                        x = screen.width + 1;                          //just off the screen
                        y = Math.floor(Math.random() * screen.height); //random position on screen
                    }
                } else {
                    x = details.startPos.x;
                    y = details.startPos.y;
                }


                //create the enemy
                let enemy = {
                    id: (Math.random().toString(36) + '00000000000000000').slice(2, 7),
                    position: {
                        x, y
                    },
                    type: details.type,
                    health: enemyTypes[details.type].health
                };
                enemies[enemy.id] = enemy;

                let creationRate = 1;
                if (details.creationRate !== undefined) {
                    creationRate = details.creationRate;
                } else {
                    creationRate = enemyTypes[enemy.type].creationRate;
                }

                //movement
                enemies[enemy.id].moveTimer = setInterval(() => {
                    if (enemy.position.x - 1 >= -1) {
                        enemy.position.x--;
                        bus_out.emit('enemy:position', {
                            id: enemy.id,
                            position: enemies[enemy.id].position,
                            type: enemies[enemy.id].type,
                            health: enemies[enemy.id].health
                        });
                        if (enemy.position.y === ship.position.y && enemy.position.x === ship.position.x) {
                            //emit damage
                            bus_in.emit('ship:damage', enemyTypes[enemy.type].damage.collision, 'random');
                        }
                    } else {
                        enemies[enemy.id] = undefined;
                    }
                }, 1000 / (enemyTypes[enemy.type].speed + ship.speed));

                //projectiles
                if (enemyTypes[enemies[enemy.id].type].gun !== undefined && enemyTypes[enemies[enemy.id].type].gun.projectile !== undefined) {
                    setTimeout(() => {
                        if (enemies[enemy.id] !== undefined) {
                            createEnemy({
                                type: enemyTypes[enemyTypes[enemies[enemy.id].type].gun.projectile].name,
                                isProjectile: true,
                                parent: enemies[enemy.id],
                                creationRate: enemyTypes[enemies[enemy.id].type].gun.rateOfFire
                            });
                        }
                    }, ((Math.random() * 10000) / level) / enemyTypes[enemies[enemy.id].type].gun.rateOfFire);
                }

                enemies[enemy.id].createTimer = setTimeout(() => {
                    createEnemy({
                        type: details.type,
                        creationRate: creationRate
                    });
                },
                ((Math.random() * 10000) / level) / creationRate); //create enemy randomly every 1-10 seconds
            }
        }
    };

    bus_in.on('enemy:get_closest', () => {
        let enemyList = [];

        for (let i = 0; i < screen.width; i++) {
            for (enemy in enemies) {
                if (enemies[enemy].position.x === i && enemyList.length < 6 && enemy.type === 'basic') {
                    enemies.push(enemies[enemy].id);
                } else {break;}
            }
        }

        bus_out.emit('enemy:closest', enemyList);
    });

    //set up game
    bus_in.on('game:start', () => {
        level = 1;
        console.log('Start Game');
        setTimeout(() => {createEnemy({type: 'asteroid'});}, Math.random() * 100);
        setTimeout(() => {createEnemy({type: 'basic'});}, Math.random() * 100);

        bus_out.emit('ship:position', ship.position);
        bus_out.emit('ship:status', ship);
        bus_out.emit('game:started');
    });

    bus_in.on('game:end', (details) => {
        for (let enemy in enemies) {
            if (enemies[enemy] !== undefined && enemies[enemy].moveTimer !== undefined) {
                clearInterval(enemies[enemy].moveTimer);
            }
        }

        if (details.reason === 'disconnect') {
            console.log('disconnect');
        } else if (details.reason === 'death') {
            console.log('death');
        } else if (details.reason === 'win') {
            console.log('win');
        }
        bus_out.emit('game:ended', details);
    });

    bus_in.on('player:join', (playerID) => {
        players[playerID] = {
            number: playerCount++,
            ready: false,
            health: 100
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

    bus_in.on('ship:get_status', () => {
        bus_out.emit('ship:status', ship);
    });

    //in game actions

    //bridge
    bus_in.on('ship:move:up', () => {
        if (ship.power.bridge >= 2) {
            ship.power.bridge -= 2;
            if (ship.position.y >= 1) {
                ship.position.y = ship.position.y - 1;
            }
        }
        bus_out.emit('ship:status', ship);
    });

    bus_in.on('ship:move:down', () => {
        if (ship.power.bridge >= 2) {
            ship.power.bridge -= 2;
            if (ship.position.y <= screen.height - 2) {
                ship.position.y = ship.position.y + 1;
            }
        }
        bus_out.emit('ship:status', ship);
    });

    bus_in.on('ship:fire', (enemyID) => {
        if (enemies[enemyID] !== undefined) {
            if (enemies[enemyID].health - ship.damage.weapons <= 0) {
                enemies[enemyID].health -= ship.damage.weapons;
                clearInterval(enemies[enemyID].moveTimer);
                clearTimeout(enemies[enemyID].createTimer);
                enemies[enemyID].position.x = -1;
                enemies[enemyID].position.y = -1;
            } else {
                enemies[enemyID].health -= ship.damage.weapons;
            }
        }
        bus_out.emit('ship:fired', {
            id: enemies[enemyID].id,
            position: enemies[enemyID].position,
            type: enemies[enemyID].type,
            health: enemies[enemyID].health
        });
    });

    bus_in.on('ship:fire_closest', () => {
        let closest = '';

        for (let i = 0; i < screen.width; i++) {
            for (let enemy in enemies) {
                if (enemies[enemy].position.y === ship.position.y && enemies[enemy].position.x === i && enemy.type === 'basic') {
                    closest = enemies[enemy].id;
                    break;
                }
            }
        }

        bus_in.emit('ship:fire', closest);
    });

    bus_in.on('ship:generate_power', () => {
        ship.power.bridge++;
        bus_out.emit('ship:status', ship);
    });

    bus_in.on('ship:move_power', (destination) => {
        ship.power.bridge--;
        ship.power[destination]++;
        bus_out.emit('ship:status', ship);
    });

    bus_in.on('ship:use_power', (amount, location) => {
        ship.power[destination] -= amount;
        bus_out.emit('ship:status', ship);
    });

    bus_in.on('ship:damage', (value, location) => {
        let damage = (value, location) => {
            if (location === 'random') {
                for (location in ship.health) {
                    let randomNumber = Math.floor(Math.random() * 6);
                    let randomLocation = '';
                    switch (randomNumber) {
                        case 0: randomLocation = 'bridge'; break;
                        case 1: randomLocation = 'engineering'; break;
                        case 2: randomLocation = 'shields'; break;
                        case 3: randomLocation = 'weapons'; break;
                        case 4: randomLocation = 'hull'; break;
                        case 5: randomLocation = 'hull'; break;
                    }
                    damage(1, randomLocation);
                }
            } else {
                ship.health[location] -= value;
                if (ship.health[location] < 0) {
                    ship.health[location] = 0;
                }
            }
        };

        if (ship.health.main_shields <= 0) {                 //no shields, take damage
            damage(value, location);
        } else if (ship.health.main_shields - value >= 0) {   //shields absorb it
            ship.health.main_shields -= value;
        } else if (ship.health.main_shields - value < 0) {   //shields destroyed, take some damage
            ship.health.main_shields -= value;
            damage(-ship.health.main_shields, location);
            ship.health.main_shields = 0;
        }

        if (ship.health.hull <= 0) {
            ship.health.hull = 0;
            bus_in.emit('game:end', {reason:'death'});
        }
        bus_out.emit('ship:status', ship);
    });

    //engineering
    bus_in.on('ship:repair', (value, location) => {
        if (ship.engineering.power >= 2) {
            ship.engineering.power -= 2;
            if (ship.health[location] >= ship.max_health[location]) {
                //do nothing...
            } else if (ship.health[location] + value >= ship.max_health[location]) {
                ship.health[location] = ship.max_health[location];
            } else if (ship.health[location] + value <= ship.max_health[location]) {
                ship.health[location] += value;
            }
        }
        bus_out.emit('ship:status', ship);
    });

    return {
        in: bus_in,
        out: bus_out
    }
}
