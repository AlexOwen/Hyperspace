var initShipDisplay = function(socket) {
    $('#grid').css('height',window.innerHeight * 0.85);

    var width = 35, height = 7;

    var ship = {
        position: {
            x: 0,
            y: 0
        }
    };

    socket.on('game:ended', function(details) {
        alert('GAME OVER....' + details.reason);
    });

    var enemies = {};

    socket.on('ship:status', function(shipData) {
        if (shipData.health !== undefined && shipData.health.life !== undefined && shipData.health.shields !== undefined) {
            $('#life_value').html(shipData.health.life);
            if (shipData.health.life < 10) {
                $('#life_value').css('color', 'red');
            }
            $('#shields_value').html(shipData.health.shields);
            if (shipData.health.shields < 10) {
                $('#shields_value').css('color', 'red');
            }
        }
        if (shipData.position !== undefined) {
            $('#cell_0_' + ship.position.y).html('');
            ship.position = shipData.position;
            $('#cell_0_' + shipData.position.y).html('=>');
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

    var start = true;
    socket.on('enemy:position', function(enemy) {
        if (start) {
            start = false;
            socket.emit('ship:get_status');
        }
        var symbol = '';
        if (enemy.type === 'asteroid') {
            symbol = '<i class="icon-asteroid1"></i>';
        } else if (enemy.type === 'basic') {
            symbol = '<i class="icon-ship1"></i>';
        } else if (enemy.type === 'projectile') {
            symbol = '<i class="icon-bullet"></i>';
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
