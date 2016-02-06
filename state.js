'use strict';
exports.init = () => {

    let events = require('events');
    let bus_in = new events.EventEmitter;
    let bus_out = new events.EventEmitter;

    let screen = {
        width: 7,
        height: 5
    };

    let ship = {
        position: {
            h: 3,
            v: 1
        }
    };

    bus_in.on('ship:move:up', function() {
        if (ship.position.v + 1 <= screen.height) {
            ship.position.v = ship.position.v + 1;
            bus_out.emit('ship:position:v', ship.position.v);
        }
        console.log('ship position: ' + ship.position.v);
    });

    bus_in.on('ship:move:down', function() {
        if (ship.position.v - 1 >= 0) {
            ship.position.v = ship.position.v - 1;
            bus_out.emit('ship:position:v', ship.position.v);
        }
        console.log('ship position: ' + ship.position.v);
    });

    return {
        in: bus_in,
        out: bus_out
    }
}
