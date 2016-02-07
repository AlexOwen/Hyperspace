var initShipDisplay = function(socket) {

    var width = 20, height = 7;

    var speeds = {
        ship: 1,
        projectile: 10,
        asteroid: 1,
        basic: 1
    }

    $('#grid').css({
        margin: 'auto',
        marginTop: '20px',
        height: window.innerHeight * 0.85,
        width: window.innerWidth * 0.85,
        position: 'relative',
        overflow: 'hidden'
    });

    $('#game_stats').css({
        width: window.innerWidth * 0.85,
        position: 'relative',
        margin: 'auto'
    });

    var ship = {
        type: 'ship',
        elem: {},
        position: {
            x: 0,
            y: 0
        }
    };

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
                if (object.type === 'ship') {
                    $(object.elem).animate({top: (((newPosition.y+0.3) * vGridUnit) - 1.5) + '%'}, animateSpeed, 'linear');
                } else {
                    $(object.elem).animate({top: 'calc(' + (newPosition.y+0.5) * vGridUnit + '% - 15px)'}, animateSpeed, 'linear');
                }
            } else if (newX > oldX || newX < oldX) {   //move right/left
                $(object.elem).animate({left: newPosition.x * hGridUnit + '%'}, animateSpeed, 'linear');
            }
        }
    };

    var place = function(object, newPosition) {
        if (object.type === 'ship') {
            $(object.elem).css('top', (((newPosition.y+0.3) * vGridUnit) - 1.5) + '%');
        } else {
            $(object.elem).css('top', 'calc(' + (newPosition.y+0.5) * vGridUnit + '% - 15px)');
        }
        $(object.elem).css('left', newPosition.x * hGridUnit + '%');
    };

    $('#grid').append('<div id="ship" style="position:absolute;width:margin:auto;width:' + hGridUnit + '%;height:' + vGridUnit + '%;"><img src="/img/ship.png" style="height:60%;""/></div>');
    ship.elem = $('#ship');
    place(ship, {x: 0, y: 3});

    socket.on('ship:status', function(shipData) {
        if (shipData.health !== undefined && shipData.health.hull !== undefined && shipData.health.main_shields !== undefined) {
            $('#hull_value').html(shipData.health.hull);
            if (shipData.health.hull < 10) {
                $('#hull_value').css('color', '#C90606');
            }

            $('#main_shields_value').html(shipData.health.main_shields);
            if (shipData.health.main_shields < 10) {
                $('#main_shields_value').css('color', '#C90606');
            }

            $('#bridge_value').html(shipData.health.bridge);
            if (shipData.health.bridge < 10) {
                $('#bridge_value').css('color', '#C90606');
            }

            $('#engineering_value').html(shipData.health.engineering);
            if (shipData.health.engineering < 10) {
                $('#engineering_value').css('color', '#C90606');
            }

            $('#weapons_value').html(shipData.health.weapons);
            if (shipData.health.weapons < 10) {
                $('#weapons_value').css('color', '#C90606');
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
        enemyDamaged(enemy);
    });

    var enemyDamaged = function(enemy) {
        if (enemy !== undefined && enemy.health !== undefined) {
            if (enemy.health <= 0) {
                $('#enemy_' + enemy.id).html('X');
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
            $('#grid').append('<div class="enemy" id="enemy_' + enemy.id + '" style="position:absolute;width:' + hGridUnit + '%;height:' + vGridUnit + '%;font-size: 30px;color:#C90606;width:' + hGridUnit + '%;height:' + vGridUnit + '%;line-height:' + vGridUnit + '%;position:absolute;" data-id="' + enemy.id + '">' + symbol + '</div>');
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

    for (var j=0; j < width * height; j++) {
        $('#grid').append('<div class="grid_cell" style="border:1px solid #17ae17;width:' + 100/width + '%;height:' + 100/height + '%; box-sizing:border-box;float:left;opacity:0.5"/>');
    }
};
