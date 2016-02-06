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
                    <div id="life" style={{float:'left'}}>Life<span></span></div>
                    <div id="shields" style={{float:'left'}}>Shields<span></span></div>
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
                rolePanel = <PlayerWeapons />;
                break;
            case 'shields':
                rolePanel = <PlayerShields />;
                break;
            case 'engineering':
                rolePanel = <PlayerEngine />;
                break;
            default:    
            case 'bridge':
                rolePanel = 
                    <PlayerBridge 
                        onShipMove = {this.props.onShipMove}
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
        console.log(direction);
        this.props.onShipMove(direction);   
    },

    handleShipPower(toRole) {
        console.log(toRole);
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
                <div className="power">
                    <button 
                        className="metal linear"
                        type="button"
                        onClick={this.handleShipPower.bind(this, "weapons")}
                        >
                        <span className="icon-weapons"></span>
                    </button>
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
                <div className="status">
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
                <div className="arrows">
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
    render() {
        return (
            <div>
                <h3>Engineering</h3>            
            </div>
        );
    }
});

var PlayerShields = React.createClass({
    render() {
        return (
            <div>
                <h3>Shields</h3>            
            </div>
        );
    }
});

var ShipEnd = React.createClass({
    render() {
        return (
            <div>
                <h3>The End</h3>            
            </div>
        );
    }
});

var PlayerEnd = React.createClass({
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
        
        socket.on('ship:status', this._shipStatusUpdate);

        // socket.on('player:joined', this._playerJoined);
        // socket.on('player:left', this._playerLeft);
    },

    _disconnect() {
        this.setState(this.getInitialState());
    },

    // _initialize(data) {
    //  var {users, name} = data;
    //  this.setState({users, user: name});
    // },

    // _messageRecieve(message) {
    //  var {messages} = this.state;
    //  messages.push(message);
    //  this.setState({messages});
    // },

    // _playerJoined(playerNumber) {
    //  console.log("player:joined " + playerNumber)
    //  var {_players} = this.state;
    //  _players.push(playerNumber);
    //  this.setState({_players});
    // },

    // _playerLeft(playerNumber) {
    //  console.log("player:left " + playerNumber)
    //  var {_players} = this.state;
        
    //  var index = users.indexOf(playerNumber);
    //  _players.splice(index, 1);
    //  this.setState({_players});
    // },

    // _userChangedName(data) {
    //  var {oldName, newName} = data;
    //  var {users, messages} = this.state;
    //  var index = users.indexOf(oldName);
    //  users.splice(index, 1, newName);
    //  messages.push({
    //      user: 'APPLICATION BOT',
    //      text : 'Change Name : ' + oldName + ' ==> '+ newName
    //  });
    //  this.setState({users, messages});
    // },

    // handleMessageSubmit(message) {
    //  var {messages} = this.state;
    //  messages.push(message);
    //  this.setState({messages});
    //  socket.emit('send:message', message);
    // },

    // handleChangeName(newName) {
    //  var oldName = this.state.user;
    //  socket.emit('change:name', { name : newName}, (result) => {
    //      if(!result) {
    //          return alert('There was an error changing your name');
    //      }
    //      var {users} = this.state;
    //      var index = users.indexOf(oldName);
    //      users.splice(index, 1, newName);
    //      this.setState({users, user: newName});
    //  });
    // },

    handleGameCreate() {
        socket.emit('game:create');
    },

    _gameCreated(gameId) {
        //go to main screen lobby
        this.setState({ ship: true, _gameId: gameId, _gameState: 'lobby' });
    },

    handleGameJoin(gameId) {
        socket.emit('game:join', gameId);
    },

    _gameJoined(gameId) {
        //player location
        this.setState({ ship: false, _gameId: gameId, _gameState: 'lobby' });
    },

    handlePlayerReady() {
        socket.emit('player:ready', true);
    },

    _readyPlayers(players) {
        //player location
        this.setState({ _players: players });
    },

    _gameStarted() {
        //player location
        console.log('game:started');
        this.setState({ _gameState: 'started' });
    },

    handleShipMove(direction) {
        var command = 'ship:move:' + direction
        socket.emit(command);
        console.log(command);
    },

    _shipStatusUpdate(shipStatus) {
        console.log(shipStatus);
        this.setState({ _shipStatus: shipStatus });
    },

    render() {
        var panel = 
            <Home
                onGameCreate={this.handleGameCreate}
                onGameJoin={this.handleGameJoin}
            />;

        if (this.state.ship) {
            switch(this.state._gameState) {
                case 'end':
                    panel = 
                        <ShipEnd
                        />
                    break;
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
                case 'end':
                    panel = 
                        <PlayerEnd
                        />
                    break;
                case 'started':
                    panel = 
                        <PlayerContainer
                            gameId = {this.state._gameId}
                            shipStatus = {this.state._shipStatus}
                            onShipMove = {this.handleShipMove}
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