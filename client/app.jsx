'use strict';

var React = require('react');

var socket = io.connect();

var ROLES = ['bridge', 'weapons', 'engineering', 'shields']

var getValueColour = function(value) {
    // if (value < 20) { return "red"; } else
    // if (value < 50) { return "orange"; }
    // return "green";
    return "blue";
}

var Home = React.createClass({
    getInitialState() {
        return {gameId: ''};
    },

    handleGameCreate(e) {
        e.preventDefault();
        this.props.onGameCreate();
    },

    handleGameJoin(e) {
        e.preventDefault();
        var gameId = this.state.gameId
        var alphanumericRegex = /^[0-9a-z]+$/;

        if(gameId.match(alphanumericRegex) && gameId.length == 5) {
            this.props.onGameJoin(gameId);
            // document.body.requestFullscreen();
            // if(navigator.userAgent.match(/Android/i)){
            //     window.scrollTo(0,1);
            // }
        } else {
            this.setState({ gameId : '' });
        }
    },

    changeJoinHandler(e) {
        this.setState({ gameId : e.target.value });
    },

    render() {
        return (
            <div>
                <div className='header'>
                    <h1>Don't Blow Up</h1>
                </div>
                <div className='center-wrap'>
                    <div className='home center-container'>
                        <form
                            onSubmit={this.handleGameCreate}
                            className="form-create"
                            >
                            <input
                                type="submit"
                                value="Create game"
                                className="btn btn-lg btn-primary"
                                />
                        </form>
                        <form
                            onSubmit={this.handleGameJoin}
                            className="form-join"
                            >
                            <input
                                onChange={this.changeJoinHandler}
                                value={this.state.gameId}
                                placeholder="12345"
                                className="join-text"
                                maxLength="5"
                                type="number"
                            />
                            <input
                                type="submit"
                                value="Join game"
                                className="btn btn-lg btn-success join-button"
                            />
                        </form>
                    </div>
                </div>
            </div>
        );
    }
});

var ShipLobby = React.createClass({
    render() {
        return (
            <div>
                <div className='header'>
                    <h1>Don't Blow Up</h1>
                </div>
                <div className='center-wrap'>
                    <div className='center-container'>
                        <div className='container'>
                            <h2 className="shake">{this.props.gameId}</h2>
                        </div>
                        <div className='container'>
                            <h2>Players</h2>
                            <ul>
                                {
                                    this.props.players.map((player, i) => {
                                        return (
                                            <li key={i}>
                                                <h3>
                                                    Player {player.number}..&nbsp;
                                                    <span className={player.ready ? "green" : "red"}>
                                                        {player.ready ? "Ready" : "Not Ready"}&nbsp;
                                                        <span className={player.ready ? "glyphicon glyphicon-thumbs-up green" : "glyphicon glyphicon-thumbs-down red"}></span>
                                                    </span>
                                                </h3>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var ShipLive = React.createClass({
    componentDidMount: function() {
        initShipDisplay(socket, this.props.gameId);
    },
    render() {
        return (
            <div>
                <div id="grid">
                </div>
                <div id="game_stats" style={{'position':'relative'}}>
                    <div id="gameid" style={{float:'left'}}></div>
                    <div id="main_shields" style={{float:'left',marginLeft:'20px',fontSize:'30px','marginRight':'20px','width':'15%'}}>Main Shields <span id="main_shields_value"></span></div>
                    <div id="hull" style={{float:'left',fontSize:'30px','marginRight':'20px','width':'15%'}}>Hull <span id="hull_value"></span></div>
                    <div id="hull" style={{float:'left',fontSize:'30px','marginRight':'20px','width':'15%'}}>Bridge <span id="bridge_value"></span></div>
                    <div id="hull" style={{float:'left',fontSize:'30px','marginRight':'20px','width':'15%'}}>Weapons <span id="weapons_value"></span></div>
                    <div id="hull" style={{float:'left',fontSize:'30px','marginRight':'20px','width':'15%'}}>Engineering <span id="engineering_value"></span></div>
                    <div id="hull" style={{float:'left',fontSize:'30px','width':'15%'}}>Shields <span id="shields_value"></span></div>
                </div>
            </div>
        );
    }
});

var PlayerLobby = React.createClass({
    getInitialState() {
        return {
            isReady: false
        };
    },

    handleReady(e) {
        e.preventDefault();
        this.setState({ isReady : true });
        this.props.onPlayerReady();
    },

    render() {
        var readyView =
            <form
                onSubmit={this.handleReady}
                >
                <input
                    type="submit"
                    value="I'm Ready"
                    className="btn btn-lg btn-default"
                />
            </form>;
        if (this.state.isReady) {
            readyView =
                <span>
                    <h2 className="green">Ready and waiting..!</h2>
                </span>;
        }

        return (
            <div>
                <div className='header'>
                    <h1>Dont Blow Up</h1>
                </div>
                <div className='center-wrap'>
                    <div className='center-container'>
                        <div className='container'>
                            {readyView}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var PlayerContainer = React.createClass({
    getInitialState() {
        return {
            role: _.sample(ROLES)
        };
    },

    handleMenuItem(role) {
        console.log(role)
        this.setState({ role : role });
    },

    render() {
        var rolePanel;

        switch(this.state.role) {
            case 'weapons':
                rolePanel =
                    <PlayerWeapons
                        shipStatus = {this.props.shipStatus}
                        onFire = {this.props.onFire}
                    />;
                break;
            case 'shields':
                rolePanel =
                    <PlayerShields
                        shipStatus = {this.props.shipStatus}
                        onShieldAdd = {this.props.onShieldAdd}
                        onShieldUsePower = {this.props.onShieldUsePower}
                    />;
                break;
            case 'engineering':
                rolePanel =
                    <PlayerEngine
                        shipStatus = {this.props.shipStatus}
                        onGenerateBridgePower = {this.props.onGenerateBridgePower}
                        onCauseEngineDamage = {this.props.onCauseEngineDamage}
                        onShipRepair = {this.props.onShipRepair}
                    />;
                break;
            default:
            case 'bridge':
                rolePanel =
                    <PlayerBridge
                        onShipMove = {this.props.onShipMove}
                        onMovePower = {this.props.onMovePower}
                        shipStatus = {this.props.shipStatus}
                    />;
                break;

        }

        return (
            <div>
                <div className='playerNav'>
                    {ROLES.map((role, i) =>
                        <div
                            className="cell"
                            key={role}
                            onClick={this.handleMenuItem.bind(this, role)}
                        >
                            <span
                                className={this.state.role == role ? "green icon-"+role : "icon-"+role }
                            ></span>
                        </div>
                    )}
                    <div className="clr"></div>
                </div>
                {rolePanel}
            </div>
        );
    }
});

var PlayerBridge = React.createClass({
    handleShipMove(direction) {
        console.log(direction)
        this.props.onShipMove(direction);
    },

    handleMovePower(toRole) {
        this.props.onMovePower(toRole);
    },

    render() {
        return (
            <div className="player-bridge container">
                <h3>Bridge:&nbsp;
                    <span className={getValueColour(this.props.shipStatus.power.bridge)}>
                        {this.props.shipStatus.power.bridge}
                        <span className="glyphicon glyphicon-flash"></span>
                    </span>
                </h3>
                <div className={this.props.shipStatus.health.bridge < 1 ? "shitfan" : "aok"}>
                    <div className="section power small">
                        <button
                            className="metal linear"
                            type="button"
                            onClick={this.handleMovePower.bind(this, "weapons")}
                            >
                            <span className="icon-weapons"></span>
                            <span className="tr">
                                -1<span className="glyphicon glyphicon-flash"></span>
                            </span>
                            <span className="br">
                                +1<span className="glyphicon glyphicon-flash"></span>
                            </span>
                        </button>
                        <button
                            className="metal linear"
                            type="button"
                            onClick={this.handleMovePower.bind(this, "engineering")}
                            >
                            <span className="icon-engineering"></span>
                            <span className="tr">
                                -1<span className="glyphicon glyphicon-flash"></span>
                            </span>
                            <span className="br">
                                +1<span className="glyphicon glyphicon-flash"></span>
                            </span>
                        </button>
                        <button
                            className="metal linear"
                            type="button"
                            onClick={this.handleMovePower.bind(this, "shields")}
                            >
                            <span className="icon-shields"></span>
                            <span className="tr">
                                -1<span className="glyphicon glyphicon-flash"></span>
                            </span>
                            <span className="br">
                                +1<span className="glyphicon glyphicon-flash"></span>
                            </span>
                        </button>
                        <div className="clr"></div>
                    </div>
                    <div className="section status">
                        <ul>
                            <li>
                                Hull:&nbsp;
                                <span className="red">
                                    {this.props.shipStatus.health.hull} / 50
                                    <span className="glyphicon glyphicon-apple"></span>
                                </span>
                            </li>
                            <li>
                                Main shields:&nbsp;
                                <span className="blue">
                                    {this.props.shipStatus.health.main_shields} / 50
                                    <span className="glyphicon glyphicon-apple"></span>
                                </span>
                            </li>
                            <li>
                                Weapons:&nbsp;
                                <span className="green">
                                    {this.props.shipStatus.health.weapons} / 10
                                    <span className="glyphicon glyphicon-apple"></span>
                                </span>
                            </li>
                            <li>
                                Engineering:&nbsp;
                                <span className="green">
                                    {this.props.shipStatus.health.engineering} / 10
                                    <span className="glyphicon glyphicon-apple"></span>
                                </span>
                            </li>
                            <li>
                                Shields:&nbsp;
                                <span className="green">
                                    {this.props.shipStatus.health.shields} / 10
                                    <span className="glyphicon glyphicon-apple"></span>
                                </span>
                            </li>
                            <li>
                                Bridge:&nbsp;
                                <span className="green">
                                    {this.props.shipStatus.health.bridge} / 10
                                    <span className="glyphicon glyphicon-apple"></span>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="section arrows">
                        <button
                            className="metal linear"
                            type="button"
                            onClick={this.handleShipMove.bind(this, "up")}
                            >
                            <span
                                className="glyphicon glyphicon-chevron-up"
                                >
                            </span>
                            <span className="tr">
                                -2<span className="glyphicon glyphicon-flash"></span>
                            </span>
                        </button>
                        <button
                            className="metal linear"
                            type="button"
                            onClick={this.handleShipMove.bind(this, "down")}>
                            <span
                                className="glyphicon glyphicon-chevron-down"
                                >
                            </span>
                            <span className="tr">
                                -2<span className="glyphicon glyphicon-flash"></span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
});

var PlayerWeapons = React.createClass({
    getInitialState() {
        return {
        };
    },

    componentDidMount: function() {

    },

    componentWillUnmount: function() {

    },

    handleClickFire() {
        this.props.onFire();
    },

    render() {
        return (
            <div className="player-engine container">
                <h3>Weapons:&nbsp;
                    <span className={getValueColour(this.props.shipStatus.power.weapons)}>
                        {this.props.shipStatus.power.weapons}
                        <span className="glyphicon glyphicon-flash"></span>
                    </span>
                </h3>
                <div className={this.props.shipStatus.health.weapons < 1 ? "shitfan" : "aok"}>
                    <div className="section arrows">
                        <button
                            className="metal linear text"
                            type="button"
                            onClick={this.handleClickFire}>
                            <span>FIRE!
                            </span>
                            <span className="tr">
                                -2<span className="glyphicon glyphicon-flash"></span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
});


var PlayerEngine = React.createClass({
    getInitialState() {
        return {
            cellItems: Array.apply(null, {length: 12}).map(Number.call, Number),
            targetItem: 0
        };
    },

    componentDidMount: function() {
        this.resetTarget();
    },

    componentWillUnmount: function() {
        window.clearTimeout(this.timeout);
    },

    handleShipRepair(toRole) {
        this.props.onShipRepair(toRole);
        // this.props.onShipRepair("random");
    },

    handleClickCell(i) {
        if (this.state.cellItems[i] == this.state.targetItem) {
            this.props.onGenerateBridgePower();
        } else {
            this.props.onCauseEngineDamage("random");
            window.navigator.vibrate(200);
        }

        var cellItems = this.state.cellItems;
        cellItems[i] = ''
        this.setState({cellItems});
    },

    resetTarget() {
        this.timeout = window.setTimeout(this.resetTarget, Math.random()*2000+1000);

        var targetItem = Math.floor(Math.random()*4);
        if (this.state.targetItem == targetItem){
            targetItem = (targetItem+1)%4
        }
        console.log(targetItem)
        this.setState({targetItem});

        var cellItems = []
        for (var i =0; i<12; i++){
            cellItems.push(Math.floor(Math.random()*4));
        }

        this.setState({cellItems});
    },

    render() {
        return (
            <div className="player-engine container">
                <h3>Engineering:&nbsp;
                    <span className={getValueColour(this.props.shipStatus.power.engineering)}>
                        {this.props.shipStatus.power.engineering}
                        <span className="glyphicon glyphicon-flash"></span>
                    </span>
                </h3>
                <div className={this.props.shipStatus.health.bridge < 1 ? "shitfan" : "aok"}>
                    <div className="section grid">
                        {this.state.cellItems.map((x, i) =>
                            <div
                                className="metal linear cell noselect"
                                key={i}
                                onClick={this.handleClickCell.bind(this, i)}
                            >
                                <span>{x}</span>
                            </div>
                        )}
                        <div className="clr"></div>
                        <div className="cell target"><span>{this.state.targetItem}</span></div>
                        <div className="clr"></div>
                    </div>
                </div>
                <div className="section power small">
                    <button
                        className="metal linear"
                        type="button"
                        onClick={this.handleShipRepair.bind(this, "hull")}
                        >
                        <span className="icon-noun_79117_cc"></span>
                        <span className="tr">
                            -2<span className="glyphicon glyphicon-flash"></span>
                        </span>
                        <span className="br">
                            +1<span className="glyphicon glyphicon-apple"></span>
                        </span>
                    </button>
                    <button
                        className="metal linear"
                        type="button"
                        onClick={this.handleShipRepair.bind(this, "bridge")}
                        >
                        <span className="icon-bridge"></span>
                        <span className="tr">
                            -2<span className="glyphicon glyphicon-flash"></span>
                        </span>
                        <span className="br">
                            +1<span className="glyphicon glyphicon-apple"></span>
                        </span>
                    </button>
                    <button
                        className="metal linear"
                        type="button"
                        onClick={this.handleShipRepair.bind(this, "weapons")}
                        >
                        <span className="icon-weapons"></span>
                        <span className="tr">
                            -2<span className="glyphicon glyphicon-flash"></span>
                        </span>
                        <span className="br">
                            +1<span className="glyphicon glyphicon-apple"></span>
                        </span>
                    </button>
                    <div className="clr"></div>
                </div>
                <div className="section power small left-shift">
                    <button
                        className="metal linear"
                        type="button"
                        onClick={this.handleShipRepair.bind(this, "engineering")}
                        >
                        <span className="icon-engineering"></span>
                        <span className="tr">
                            -2<span className="glyphicon glyphicon-flash"></span>
                        </span>
                        <span className="br">
                            +1<span className="glyphicon glyphicon-apple"></span>
                        </span>
                    </button>
                    <button
                        className="metal linear"
                        type="button"
                        onClick={this.handleShipRepair.bind(this, "shields")}
                        >
                        <span className="icon-shields"></span>
                        <span className="tr">
                            -2<span className="glyphicon glyphicon-flash"></span>
                        </span>
                        <span className="br">
                            +1<span className="glyphicon glyphicon-apple"></span>
                        </span>
                    </button>
                    <div className="clr"></div>
                </div>
            </div>
        );
    }
});

var PlayerShields = React.createClass({
    getInitialState() {
        return {
            cellItems: [],
            shownCells: [],
            isShowing: false,
            cost: 1,
        };
    },

    componentDidMount: function() {
        this.handleReset();
    },

    componentWillUnmount: function() {
        window.clearTimeout(this.timeout);
    },

    handleClickCell(i) {
        var shownCells = this.state.shownCells;
        var cellItems = this.state.cellItems;
        var cost = this.state.cost;

        console.log(i);
        if (cellItems[i] === ''
            || (this.state.isShowing && shownCells.length == 2)
            || (shownCells.length == 1 && shownCells[0] == i)) {
            console.log('nothing there')
            return
        }

        if (shownCells.length == 0){
            shownCells.push(i);
        } else if (shownCells.length == 1){
            shownCells.push(i);
            if (cellItems[shownCells[0]] == cellItems[shownCells[1]]) {
                console.log("+1");
                this.props.onShieldAdd(10);
                this.timeout = window.setTimeout(this.removeTiles, 500);
            } else {
                console.log("-1");
                window.navigator.vibrate(200);
                this.timeout = window.setTimeout(this.resetShown, 500);
            }
            this.props.onShieldUsePower(cost);
        }
        console.log(shownCells);
        console.log(cellItems);

        this.setState({shownCells});
        this.setState({isShowing: true});
    },

    removeTiles() {
        var shownCells = this.state.shownCells;
        var cellItems = this.state.cellItems;
        var cost = this.state.cost + 1;

        if (shownCells.length == 2){
            if (cellItems[shownCells[0]] == cellItems[shownCells[1]]) {
                cellItems[shownCells[0]] = '';
                cellItems[shownCells[1]] = '';
            }
        }
        // this.setState({cellItems});
        this.setState({shownCells: [], isShowing: false, cost: cost});
    },

    resetShown() {
        this.setState({shownCells: [], isShowing: false});
    },

    handleReset() {
        var cellItems = []
        for (var i =0; i<12; i++){
            cellItems.push(Math.floor(i/2));
        }
        cellItems = _.shuffle(cellItems);

        this.setState({cellItems: cellItems, cost: 0});
        this.resetShown();
    },

    render() {
        return (
            <div className="player-engine container">
                <h3>Shields:&nbsp;
                    <span className={getValueColour(this.props.shipStatus.power.shields)}>
                        {this.props.shipStatus.power.shields}
                        <span className="glyphicon glyphicon-flash"></span>
                    </span>
                </h3>
                <div className={this.props.shipStatus.health.bridge < 1 ? "shitfan" : "aok"}>
                    <div className="section grid">
                        {this.state.cellItems.map((x, i) =>
                            <div
                                className={x === '' ? "cell noselect metal linear non-vis" : "cell noselect metal linear"}
                                key={i}
                                onClick={this.handleClickCell.bind(this, i)}
                            >
                                <span>{_.contains(this.state.shownCells, i) ? x : ''}</span>
                            </div>
                        )}
                        <div className="clr"></div>
                    </div>
                    <div className="section status">
                        <h3 >
                        Cost:&nbsp;<span className="blue">{this.state.cost}<span className="glyphicon glyphicon-flash"></span></span>
                        </h3>
                    </div>
                    <div className="section reset">
                        <button
                            className="metal linear text"
                            type="button"
                            onClick={this.handleReset}
                            >
                            <span>Reset board</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
});

var GameEnd = React.createClass({
    render() {
        return (
            <div>
                <h3>The End</h3>
            </div>
        );
    }
});

var GameApp = React.createClass({

    getInitialState() {
        return {
            ship: false,
            _gameId: null,
            _gameState: 'create',
            // _gameState: 'started',
            _players: [],
            _shipStatus: {
                health: {
                    hull: 0, bridge: 0, shields: 0, engineering: 0, weapons: 0, main_shields: 0
                },
                power: {
                    bridge: 0, shields: 0, engineering: 0, weapons: 0
                },
            }
        };
    },

    componentDidMount() {
        socket.on('disconnect', this._disconnect);
        socket.on('game:created', this._gameCreated);
        socket.on('game:joined', this._gameJoined);
        socket.on('game:ready_players', this._readyPlayers);
        socket.on('game:started', this._gameStarted);
        socket.on('game:ended', this._gameEnded);

        socket.on('ship:status', this._shipStatusUpdate);

        // socket.on('player:joined', this._playerJoined);
        // socket.on('player:left', this._playerLeft);
    },

    _disconnect() {
        this.setState(this.getInitialState());
    },

    // GAME CREATE

    handleGameCreate() {
        socket.emit('game:create');
    },

    _gameCreated(gameId) {
        //go to main screen lobby
        this.setState({ ship: true, _gameId: gameId, _gameState: 'lobby' });
    },

    // GAME JOIN

    handleGameJoin(gameId) {
        socket.emit('game:join', gameId);
    },

    _gameJoined(gameId) {
        //player location
        this.setState({ ship: false, _gameId: gameId, _gameState: 'lobby' });
    },

    // PLAYER READY

    handlePlayerReady() {
        socket.emit('player:ready', true);
    },

    _readyPlayers(players) {
        //player location
        this.setState({ _players: players });
    },

    // GAME START END

    _gameStarted() {
        //player location
        console.log('game:started');
        this.setState({ _gameState: 'started' });
    },

    _gameEnded() {
        //player location
        console.log('game:ended');
        this.setState({ _gameState: 'ended' });
    },

    // SHIP

    handleShipMove(direction) {
        var command = 'ship:move:' + direction
        socket.emit(command);
        console.log(command);
    },

    _shipStatusUpdate(shipStatus) {
        // console.log(shipStatus);
        this.setState({ _shipStatus: shipStatus });
    },

    handleMovePower(role) {
        var command = 'ship:move_power'
        socket.emit(command, role);
        console.log(command);
    },

    handleGenerateBridgePower() {
        var command = 'ship:generate_power'
        socket.emit(command);
        console.log(command);
    },

    handleCauseEngineDamage(toRole) {
        var command = 'ship:damage'
        socket.emit(command, 1, toRole);
        console.log(command);
    },

    handleShipRepair(toRole) {
        var command = 'ship:repair'
        socket.emit(command, toRole);
        console.log(command);
    },

    handleFire() {
        var command = 'ship:fire_closest'
        socket.emit(command);
        console.log(command);
    },

    handleShieldAdd(shield) {
        var command = 'ship:repair'
        socket.emit(command, "main_shields", shield);
        console.log(command + ' ' + shield);
    },

    handleShieldUsePower(power) {
        var command = 'ship:use_power'
        socket.emit(command, power, "shields");
        console.log(command + ' ' + power);
    },

    render() {
        var panel =
            <Home
                onGameCreate={this.handleGameCreate}
                onGameJoin={this.handleGameJoin}
            />;

        if (this.state._gameState == 'ended') {
            panel =
                <GameEnd
                />
        } else if (this.state.ship) {
            switch(this.state._gameState) {
                case 'started':
                    panel =
                        <ShipLive
                            players = {this.state._players}
                            gameId = {this.state._gameId}
                        />
                    break;
                case 'lobby':
                    panel =
                        <ShipLobby
                            players = {this.state._players}
                            gameId = {this.state._gameId}
                        />;
                    break;
            }
        } else {
            switch(this.state._gameState) {
                case 'started':
                    panel =
                        <PlayerContainer
                            gameId = {this.state._gameId}
                            shipStatus = {this.state._shipStatus}
                            onShipMove = {this.handleShipMove}
                            onMovePower = {this.handleMovePower}
                            onCauseEngineDamage = {this.handleCauseEngineDamage}
                            onGenerateBridgePower = {this.handleGenerateBridgePower}
                            onShipRepair = {this.handleShipRepair}
                            onFire = {this.handleFire}
                            onShieldAdd = {this.handleShieldAdd}
                            onShieldUsePower = {this.handleShieldUsePower}

                        />
                    break;
                case 'lobby':
                    panel =
                        <PlayerLobby
                            players = {this.state._players}
                            onPlayerReady = {this.handlePlayerReady}
                        />;
                    break;
            }
        }


        return (
            <div className='site-wrapper'>
                {panel}
            </div>
        );
    }
});

React.render(<GameApp/>, document.getElementById('app'));
