'use strict';

var React = require('react');

var socket = io.connect();

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
			<div className='home'>
				<h3> Hyperspace </h3>
				<form 
					onSubmit={this.handleGameCreate}
					className="form-signin"
					>
					<input 
						type="submit"
						value="Create game"
						className="btn btn-lg btn-default"
						/>
				</form>	
				<form 
					onSubmit={this.handleGameJoin}
					className="form-signin"
					>
					<input
						onChange={this.changeJoinHandler}
						value={this.state.gameId}
					/>
					<input 
						type="submit"
						value="Join game"
						className="btn btn-lg btn-default"
					/>
				</form>
			</div>
		);
	}
});

var ShipLobby = React.createClass({
	render() {
		return (
			<div className='playerList'>
				<h1> GameID {this.props.gameId} </h1>
				<h3> Players </h3>
				<ul>
					{
						this.props.players.map((player, i) => {
							return (
								<li key={i}>
									Player {player.number}, Ready: {player.ready.toString()}
								</li>
							);
						})
					}
				</ul>				
			</div>
		);
	}
});

var ShipLive = React.createClass({
	render() {
		return (
			<div className='playerList'>
				<h1>playing live</h1>
				<h3> GameID {this.props.gameId} </h3>
				<h3> Players </h3>
				<ul>
					{
						this.props.players.map((player, i) => {
							return (
								<li key={i}>
									Player {player.number}, Ready: {player.ready.toString()}
								</li>
							);
						})
					}
				</ul>				
			</div>
		);
	}
});

var PlayerLobby = React.createClass({
	handlePlayerReady(e) {
		e.preventDefault();
		
		this.props.onPlayerReady();
	},

    render() {
        return (
            <div className='playerList'>
                <h3> Players </h3>
                <form 
					onSubmit={this.handlePlayerReady}
					>
					<input 
						type="submit"
						value="Ready"
						className="btn btn-lg btn-default"
					/>
				</form>
                <ul>
                    {
                        this.props.players.map((player, i) => {
                            return (
                                <li key={i}>
                                    Player {player}
                                </li>
                            );
                        })
                    }
                </ul>               
            </div>
        );
    }
});

var PlayerContainer = React.createClass({
    render() {
    	var rolePanel;

    	switch(this.props.role) {
            case 'weapons':
                rolePanel = <PlayerWeapons />;
                break;
            case 'shields':
                rolePanel = <PlayerShields />;
                break;
            case 'engine':
                rolePanel = <PlayerEngine />;
                break;
            default:	
            case 'bridge':
                rolePanel = <PlayerBridge />;
                break;

        }

        return (
            <div>
            	<div>
            		<p>{this.props.gameId}</p>
            	</div>
            	{rolePanel}
            </div>
        );
    }
});

var PlayerBridge = React.createClass({
	render() {
        return (
            <div>
                <h3>The Bridge</h3>            
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
			_players: [],
			// _playerStates: [],
            role: 'bridge'
			// messages:[],
			// text: '',
		};
	},

	componentDidMount() {
		socket.on('disconnect', this._disconnect);
		socket.on('game:created', this._gameCreated);
		socket.on('game:joined', this._gameJoined);
		socket.on('game:ready_players', this._readyPlayers);
		socket.on('game:started', this._gameStarted);

		// socket.on('player:joined', this._playerJoined);
		// socket.on('player:left', this._playerLeft);
	},

	_disconnect() {
		this.setState(this.getInitialState());
	},

	// _initialize(data) {
	// 	var {users, name} = data;
	// 	this.setState({users, user: name});
	// },

	// _messageRecieve(message) {
	// 	var {messages} = this.state;
	// 	messages.push(message);
	// 	this.setState({messages});
	// },

	// _playerJoined(playerNumber) {
	// 	console.log("player:joined " + playerNumber)
	// 	var {_players} = this.state;
	// 	_players.push(playerNumber);
	// 	this.setState({_players});
	// },

	// _playerLeft(playerNumber) {
	// 	console.log("player:left " + playerNumber)
	// 	var {_players} = this.state;
		
	// 	var index = users.indexOf(playerNumber);
	// 	_players.splice(index, 1);
	// 	this.setState({_players});
	// },

	// _userChangedName(data) {
	// 	var {oldName, newName} = data;
	// 	var {users, messages} = this.state;
	// 	var index = users.indexOf(oldName);
	// 	users.splice(index, 1, newName);
	// 	messages.push({
	// 		user: 'APPLICATION BOT',
	// 		text : 'Change Name : ' + oldName + ' ==> '+ newName
	// 	});
	// 	this.setState({users, messages});
	// },

	// handleMessageSubmit(message) {
	// 	var {messages} = this.state;
	// 	messages.push(message);
	// 	this.setState({messages});
	// 	socket.emit('send:message', message);
	// },

	// handleChangeName(newName) {
	// 	var oldName = this.state.user;
	// 	socket.emit('change:name', { name : newName}, (result) => {
	// 		if(!result) {
	// 			return alert('There was an error changing your name');
	// 		}
	// 		var {users} = this.state;
	// 		var index = users.indexOf(oldName);
	// 		users.splice(index, 1, newName);
	// 		this.setState({users, user: newName});
	// 	});
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

	render() {
        var panel = 
            <Home
                onGameCreate={this.handleGameCreate}
                onGameJoin={this.handleGameJoin}
            />;

        if (this.state.ship) {
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
                    		role = {this.state.role}
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