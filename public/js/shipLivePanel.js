var initShipDisplay = function(socket) {

    $('#stars,#stars2,#stars3').hide();

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
        var animateSpeed = 300;
        if (object.type === 'ship') {
            animateSpeed = 100;
        } else {
            animateSpeed = (1000 / (speeds[object.type] + speeds['ship'])) - 20;
        }

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
        if (shipData.health !== undefined && shipData.health.hull !== undefined && shipData.health.main_shields !== undefined) {
            $('#life_value').html(shipData.health.hull);
            if (shipData.health.hull < 10) {
                $('#life_value').css('color', '#C90606');
            }
            $('#shields_value').html(shipData.health.main_shields);
            if (shipData.health.main_shields < 10) {
                $('#shields_value').css('color', '#C90606');
            }
        }
        if (shipData.position !== undefined) {
            move(ship, shipData.position);
            ship.position = shipData.position;
        }
    });

    socket.on('ship:fired', function(enemy) {
        enemyDamaged(enemy);
    });

    var enemyDamaged = function(enemy) {
        if (enemy !== undefined && enemy.health !== undefined) {
            if (enemy.health <= 0) {
                $('#enemy_' + enemy.id).addClass('hit').html('X');
                setTimeout(function() {
                    $('#enemy_' + enemy.id).remove();
                }, 500);
            } else if (enemy.health > 0) {
                var oldHtml = $('#enemy_' + enemy.id).html();
                $('#enemy_' + enemy.id).addClass('hit').html('X');
                setTimeout(function(){$('#enemy_' + enemy.id).removeClass('hit').html(oldHtml);}, 500);
            }
        }
    };

    var start = true;
    socket.on('enemy:position', function(enemy) {
        if (start) {
            start = false;
            socket.emit('ship:get_status');
        }
        var symbol = '';

        if (enemy.type === 'asteroid') {
            symbol = '<i class="asteroid icon-asteroid1" style="color:#AAA;"></i>';
        } else if (enemy.type === 'basic') {
            symbol = '<i class="basic icon-ship1"></i>';
        } else if (enemy.type === 'projectile') {
            symbol = '<i class="projectile icon-weapons"></i>';
        }

        if (enemies[enemy.id] === undefined) {
            enemies[enemy.id] = {};
            $('#grid').append('<div class="enemy" id="enemy_' + enemy.id + '" style="position:absolute;width:' + hGridUnit + '%;height:' + vGridUnit + '%;font-size: 30px;color:#C90606" data-id="' + enemy.id + '">' + symbol + '</div>');
            $('#enemy_' + enemy.id).on('click', function() {
                var enemyID = $(this).attr('data-id');
                if (enemyID !== undefined) {
                    socket.emit('ship:fire', enemyID);
                }
            });
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
        } else {
            enemyDamaged(enemy);
        }
    });
};
