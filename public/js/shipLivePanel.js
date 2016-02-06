var initShipDisplay = function(socket) {
    var width = 35, height = 7;

    var ship = {
        position: {
            x: 0,
            y: 0
        }
    };

    socket.on('game:created', function(a) {
        $('#gameid').html(a);
    });

    socket.on('game:ended', function(details) {
        alert('GAME OVER....' + details.reason);
    });

    var enemies = {};

    socket.on('ship:position', function(pos) {
        $('#cell_' + ship.position.x + '_' + ship.position.y).html('');
        ship.position = pos;
        $('#cell_0_' + pos.y).html('=>');
    });

    socket.on('ship:status', function(ship) {
        if (ship.health !== undefined && ship.health.life !== undefined && ship.health.shields !== undefined) {
            $('#life span').html(ship.health.life);
            $('#shields span').html(ship.health.shields);
        }
    });

    socket.on('ship:fired', function(enemy) {
        if (enemy !== undefined && enemy.health !== undefined) {
            if (enemy.health <= 0) {
                $('#cell_' + enemies[enemy.id].position.x + '_' + enemies[enemy.id].position.y).addClass('hit').html('X');
                setTimeout(function() {
                    $('#cell_' + enemies[enemy.id].position.x + '_' + enemies[enemy.id].position.y).removeClass('hit').html('').removeAttr('data-id');
                }, 500);
            } else if (enemy.health <= 0) {
                $('#cell_' + enemies[enemy.id].position.x + '_' + enemies[enemy.id].position.y).addClass('hit');
                setTimeout(function(){$('#cell_' + enemies[enemy.id].position.x + '_' + enemies[enemy.id].position.y).removeClass('hit');}, 500);
            }
        }

    });

    socket.on('enemy:position', function(enemy) {
        console.log(enemy);
        var symbol = '';
        if (enemy.type === 'asteroid') {
            symbol = 'O';
        } else if (enemy.type === 'basic') {
            symbol = '<';
        } else if (enemy.type === 'projectile') {
            symbol = '-';
        }

        if (enemies[enemy.id] === undefined)
            enemies[enemy.id] = {};
        if (enemies[enemy.id].position !== undefined)
            $('#cell_' + enemies[enemy.id].position.x + '_' + enemies[enemy.id].position.y).removeAttr('data-id').html('');
        if (!(enemy.position.x === ship.position.x && enemy.position.y === ship.position.y)) {
            enemies[enemy.id].position = enemy.position;
            $('#cell_' + enemy.position.x + '_' + enemy.position.y).attr('data-id', enemy.id).attr('data-type', enemy.type).html(symbol);
        }
    });

    // socket.emit('game:create');

    // $('#up').on('click', function() {
    //     socket.emit('ship:move:up');
    // });
    // $('#down').on('click', function() {
    //     socket.emit('ship:move:down');
    // });

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            $('#grid').append('<div id="cell_' + x + '_' + y + '" style="width:' + 100/width + '%;height:' + 100/(height+1) + '%;float:left;"/>');
        }
    }

    $('div').each(function() {
        $(this).on('click', function() {
            var enemyID = $(this).attr('data-id');
            if (enemyID !== undefined) {
                socket.emit('ship:fire', enemyID);
            }
        });
    });
};