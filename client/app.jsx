'use strict';

var React = require('react');

var socket = io.connect();

var ROLES = ['bridge', 'weapons', 'engineering', 'shields']

var getValueColour = function(value) {
    if (value < 20) { return "red"; } else
    if (value < 50) { return "orange"; }
    return "green";
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
        initShipDisplay(socket);
    },
    render() {
        return (
            <div>
                <div id="grid">
                </div>
                <div style={{float:'left'}}>
                    <div id="gameid" style={{float:'left'}}></div>
                    <div id="life" style={{float:'left',fontSize:'30px'}}>Hull <span id="life_value"></span></div>
                    <div id="shields" style={{float:'left',marginLeft:'25px',fontSize:'30px'}}>Shields <span id="shields_value"></span></div>
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
            role: 'bridge'
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
                    />;
                break;
            case 'shields':
                rolePanel = 
                    <PlayerShields
                        shipStatus = {this.props.shipStatus}
                    />;
                break;
            case 'engineering':
                rolePanel = 
                    <PlayerEngine 
                        shipStatus = {this.props.shipStatus}
                        onGeneratePower = {this.props.onGeneratePower}
                        onCauseEngineDamage = {this.props.onCauseEngineDamage}
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
                        <span className="glyphicon glyphicon-ice-lolly-tasted"></span>
                    </span>
                </h3>
                <div className="section power small">
                    <button 
                        className="metal linear"
                        type="button"
                        onClick={this.handleMovePower.bind(this, "weapons")}
                        >
                        <span className="icon-weapons"></span>
                    </button>
                    <button 
                        className="metal linear"
                        type="button"
                        onClick={this.handleMovePower.bind(this, "engineering")}
                        >
                        <span className="icon-engineering"></span>
                    </button>
                    <button 
                        className="metal linear"
                        type="button"
                        onClick={this.handleMovePower.bind(this, "shields")}
                        >
                        <span className="icon-shields"></span>
                    </button>
                    <div className="clr"></div>
                </div>
                <div className="section status">
                    <ul>
                        <li>
                            Hull:&nbsp;
                            <span className={getValueColour(this.props.shipStatus.health.life)}>
                                {this.props.shipStatus.health.life}
                                <span className="glyphicon glyphicon-apple"></span>
                            </span>
                        </li>
                        <li>
                            Weapons:&nbsp;
                            <span className={getValueColour(this.props.shipStatus.health.life)}>
                                {this.props.shipStatus.health.life}
                                <span className="glyphicon glyphicon-apple"></span>
                            </span>
                        </li>
                        <li>
                            Engineering:&nbsp;
                            <span className={getValueColour(this.props.shipStatus.health.life)}>
                                {this.props.shipStatus.health.life}
                                <span className="glyphicon glyphicon-apple"></span>
                            </span>
                        </li>
                        <li>
                            Shields:&nbsp;
                            <span className={getValueColour(this.props.shipStatus.health.shields)}>
                                {this.props.shipStatus.health.shields}
                                <span className="glyphicon glyphicon-apple"></span>
                            </span>
                        </li>
                        <li>
                            Bridge:&nbsp;
                            <span className={getValueColour(this.props.shipStatus.health.life)}>
                                {this.props.shipStatus.health.life}
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
                    </button>
                    <button
                        className="metal linear"
                        type="button"
                        onClick={this.handleShipMove.bind(this, "down")}>
                        <span 
                            className="glyphicon glyphicon-chevron-down"
                            >
                        </span>
                    </button>
                </div>
            </div>
        );
    }
});

var PlayerWeapons = React.createClass({
    render() {
        return (
            <div>
                <h3>Weapons</h3>
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

    handleShipPower(toRole) {
        // increasing power
    },

    handleClickCell(i) {
        if (this.state.cellItems[i] == this.state.targetItem) {
            this.props.onGeneratePower();
        } else {
            this.props.onCauseEngineDamage();
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
                        <span className="glyphicon glyphicon-ice-lolly-tasted"></span>
                    </span>
                </h3>
                <div className="section grid">
                    {this.state.cellItems.map((x, i) =>
                        <div
                            className="cell noselect"
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
                <div className="section power small">
                    <button 
                        className="metal linear"
                        type="button"
                        onClick={this.handleShipPower.bind(this, "hull")}
                        >
                        <span className="icon-hull"></span>
                    </button>
                    <button 
                        className="metal linear"
                        type="button"
                        onClick={this.handleShipPower.bind(this, "bridge")}
                        >
                        <span className="icon-bridge"></span>
                    </button>
                    <button 
                        className="metal linear"
                        type="button"
                        onClick={this.handleShipPower.bind(this, "weapons")}
                        >
                        <span className="icon-weapons"></span>
                    </button>
                    <div className="clr"></div>
                </div>
                <div className="section power small left-shift">
                    <button 
                        className="metal linear"
                        type="button"
                        onClick={this.handleShipPower.bind(this, "engineering")}
                        >
                        <span className="icon-engineering"></span>
                    </button>
                    <button 
                        className="metal linear"
                        type="button"
                        onClick={this.handleShipPower.bind(this, "shields")}
                        >
                        <span className="icon-shields"></span>
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
            cost: 0,
        };
    },

    componentDidMount: function() {
        this.handleReset();
    },

    componentWillUnmount: function() {
        window.clearTimeout(this.timeout);
    },

    handleShipPower(toRole) {
        // increasing power
    },

    handleClickCell(i) {
        var shownCells = this.state.shownCells;
        var cellItems = this.state.cellItems;
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
                // this.props.onGeneratePower();
                this.timeout = window.setTimeout(this.removeTiles, 500);
            } else {
                console.log("-1");
                // this.props.onCauseEngineDamage();
                window.navigator.vibrate(200);
                this.timeout = window.setTimeout(this.resetShown, 500);
            }
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
                        <span className="glyphicon glyphicon-ice-lolly-tasted"></span>
                    </span>
                </h3>
                <div className="section grid">
                    {this.state.cellItems.map((x, i) =>
                        <div
                            className="cell noselect metal linear"
                            disabled={x != ''}
                            key={i}
                            onClick={this.handleClickCell.bind(this, i)}
                        >
                            <span>{_.contains(this.state.shownCells, i) ? x : ''}</span>
                        </div>
                    )}
                    <div className="clr"></div>
                </div>
                <div className="section status">
                    <h3>
                    Cost:&nbsp;{this.state.cost}<span className="glyphicon glyphicon-apple"></span>
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
            // _gameState: 'create',
            _gameState: 'started',
            _players: [],
            _shipStatus: {
                health: {
                    life: 0, bridge: 0, shields: 0, engineering: 0, weapons: 0
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
        socket.on('game:endeded', this._gameEnded);
        
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

    _gameStarted() {
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
        console.log(shipStatus);
        this.setState({ _shipStatus: shipStatus });
    },

    handleMovePower(role) {
        var command = 'ship:move_power'
        socket.emit(command, role);
        console.log(command);
    },

    handleGeneratePower() {
        var command = 'ship:generate_power'
        socket.emit(command);
        console.log(command);
    },

    handleCauseEngineDamage() {
        var command = 'ship:cause_damage'
        socket.emit(command, "engine");
        console.log(command);
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
                            onGeneratePower = {this.handleGeneratePower}
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
