var initShipDisplay = function(socket) {

    var width = 20, height = 7;

    var speeds = {
        ship: 1,
        projectile: 10,
        asteroid: 1,
        basic: 1
    }

    $('#grid').css('height', window.innerHeight * 0.85).css('width', window.innerWidth * 0.85).css('position', 'relative').css('overflow', 'hidden');

    var ship = {
        type: 'ship',
        elem: {},
        position: {
            x: 0,
            y: 0
        }
    };

    socket.on('game:ended', function(details) {
        alert('GAME OVER....' + details.reason);
    });

    var enemies = {};

    var hGridUnit = 1/width * 100;
    var vGridUnit = 1/height * 100;
    var move = function(object, newPosition) {
        console.log(speeds[object.type], speeds['ship']);
        var animateSpeed = (1000 / (speeds[object.type] + speeds['ship'])) - 30;

        console.log(newPosition);
        var newX = newPosition.x;
        var newY = newPosition.y;
        var oldX = object.position.x;
        var oldY = object.position.y;
        if (newX < 0) {
            $(object.elem).remove();
        } else {
            if (newY > oldY || newY < oldY) {          //move down/up
                $(object.elem).animate({top: newPosition.y * vGridUnit + '%'}, animateSpeed, 'linear');
            } else if (newX > oldX || newX < oldX) {   //move right/left
                $(object.elem).animate({left: newPosition.x * hGridUnit + '%'}, animateSpeed, 'linear');
            }
        }
    };

    var place = function(object, newPosition) {
        console.log(newPosition);
        $(object.elem).css('top', newPosition.y * vGridUnit + '%');
        $(object.elem).css('left', newPosition.x * hGridUnit + '%');
    };

    $('#grid').append('<div id="ship" style="position:absolute;width:' + hGridUnit + '%;height:' + vGridUnit + '%;font-size: 30px;color:#17AE17">=></div>');
    ship.elem = $('#ship');
    place(ship, {x: 0, y: 3});

    socket.on('ship:status', function(shipData) {
        if (shipData.health !== undefined && shipData.health.life !== undefined && shipData.health.shields !== undefined) {
            $('#life_value').html(shipData.health.life);
            if (shipData.health.life < 10) {
                $('#life_value').css('color', '#C90606');
            }
            $('#shields_value').html(shipData.health.shields);
            if (shipData.health.shields < 10) {
                $('#shields_value').css('color', '#C90606');
            }
        }
        if (shipData.position !== undefined) {
            move(ship, shipData.position);
            ship.position = shipData.position;
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
            symbol = '<i class="icon-weapons"></i>';
        }

        if (enemies[enemy.id] === undefined) {
            enemies[enemy.id] = {};
            $('#grid').append('<div id="enemy_' + enemy.id + '" style="position:absolute;width:' + hGridUnit + '%;height:' + vGridUnit + '%;font-size: 30px;color:#C90606">' + symbol + '</div>');
            enemies[enemy.id].elem = $('#enemy_' + enemy.id);
        }


        if (enemies[enemy.id].position === undefined) {
            place(enemies[enemy.id], {x: enemy.position.x, y: enemy.position.y});
            enemies[enemy.id].position = enemy.position;
        }

        if (enemies[enemy.id].type === undefined) {
            enemies[enemy.id].type = enemy.type;
        }

        if (!(enemy.position.x === ship.position.x && enemy.position.y === ship.position.y)) {
            move(enemies[enemy.id], {x: enemy.position.x, y: enemy.position.y});
            enemies[enemy.id].position = enemy.position;
        }
    });

    /*for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            $('#grid').append('<div id="cell_' + x + '_' + y + '" style="width:' + 100/width + '%;height:' + 100/(height+1) + '%;float:left;"/>');
        }
    }
    $('#grid div').css('font-size', ($('#grid').height()/height) - 40);*/



    $('div').each(function() {
        $(this).on('click', function() {
            var enemyID = $(this).attr('data-id');
            if (enemyID !== undefined) {
                socket.emit('ship:fire', enemyID);
            }
        });
    });
};
