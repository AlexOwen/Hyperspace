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
									Player {player.name} {player.ready}
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
    render() {
        return (
            <div className='playerList'>
                <h3> Players </h3>
                <ul>
                    {
                        this.props.players.map((player, i) => {
                            return (
                                <li key={i}>
                                    {player}
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
                panel = <PlayerWeapons />;
                break;
            case 'shields':
                panel = <PlayerShields />;
                break;
            case 'engine':
                panel = <PlayerEngine />;
                break;
           default:	
            case 'bridge':
                panel = <PlayerBridge />;
                break;

        }

        return (
            <div>
            	<PlayerMenu />
            	{rolePanel}
            </div>
        );
    }
});

var Message = React.createClass({
	render() {
		return (
			<div className="message">
				<strong>{this.props.user} :</strong> 
				<span>{this.props.text}</span>		
			</div>
		);
	}
});

var MessageList = React.createClass({
	render() {
		return (
			<div className='messages'>
				<h2> Conversation: </h2>
				{
					this.props.messages.map((message, i) => {
						return (
							<Message
								key={i}
								user={message.user}
								text={message.text} 
							/>
						);
					})
				} 
			</div>
		);
	}
});

var MessageForm = React.createClass({

	getInitialState() {
		return {text: ''};
	},

	handleSubmit(e) {
		e.preventDefault();
		var message = {
			user : this.props.user,
			text : this.state.text
		}
		this.props.onMessageSubmit(message);	
		this.setState({ text: '' });
	},

	changeHandler(e) {
		this.setState({ text : e.target.value });
	},

	render() {
		return(
			<div className='message_form'>
				<h3>Write New Message</h3>
				<form onSubmit={this.handleSubmit}>
					<input
						onChange={this.changeHandler}
						value={this.state.text}
					/>
				</form>
			</div>
		);
	}
});

var ChangeNameForm = React.createClass({
	getInitialState() {
		return {newName: ''};
	},

	onKey(e) {
		this.setState({ newName : e.target.value });
	},

	handleSubmit(e) {
		e.preventDefault();
		var newName = this.state.newName;
		this.props.onChangeName(newName);	
		this.setState({ newName: '' });
	},

	render() {
		return(
			<div className='change_name_form'>
				<h3> Change Name </h3>
				<form onSubmit={this.handleSubmit}>
					<input
						onChange={this.onKey}
						value={this.state.newName} 
					/>
				</form>	
			</div>
		);
	}
});

var ChatApp = React.createClass({

	getInitialState() {
		return {
            ship: false,
            _gameId: null,
            _gameState: 'create',
			_players: [],
            role: 'bridge'
			// messages:[],
			// text: '',
		};
	},

	componentDidMount() {
		socket.on('game:created', this._gameCreated);
		socket.on('game:joined', this._gameJoined);

		socket.on('player:joined', this._playerJoined);
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

	_playerJoined(playerNumber) {
		console.log(playerNumber)
		var {_players} = this.state;
		_players.push(playerNumber);
		this.setState({_players});
	},

	// _userLeft(data) {
	// 	var {users, messages} = this.state;
	// 	var {name} = data;
	// 	var index = users.indexOf(name);
	// 	users.splice(index, 1);
	// 	messages.push({
	// 		user: 'APPLICATION BOT',
	// 		text : name +' Left'
	// 	});
	// 	this.setState({users, messages});
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

	handleGameJoin(gameId) {
		socket.emit('game:join', gameId);
	},

	_gameCreated(gameId) {
		//go to main screen lobby
		this.setState({ ship: true, _gameId: gameId, _gameState: 'lobby' });
	},

	_gameJoined(gameId) {
		//player location
		this.setState({ ship: false, _gameId: gameId, _gameState: 'lobby' });
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
                    panel = <ShipLive />
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
                    		role = {this.state.role}
                    	/>
                    break;
                case 'lobby':
                    panel = 
                        <PlayerLobby
                            players = {this.state._players}
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

React.render(<ChatApp/>, document.getElementById('app'));