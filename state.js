'use strict';
exports.init = () => {
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
        if (ship.position.v + 1 <= width) {
            ship.position.v = ship.position.v + 1;
            bus_out.emit('ship:position:v', ship.position.v);
        }
    });

    bus_in.on('ship:move:down', function() {
        if (ship.position.v - 1 <= 0) {
            ship.position.v = ship.position.v - 1;
            bus_out.emit('ship:position:v', ship.position.v);
        }
    });


}
