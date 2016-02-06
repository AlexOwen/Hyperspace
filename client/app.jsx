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
		this.props.onGameJoin(gameId);	
	},

	changeJoinHandler(e) {
		this.setState({ gameId : e.target.value });
	},

	render() {
		return (
			<div className='home'>
				<h3> Login </h3>
				<div onClick={this.handleGameCreate}>Create game</div>
				<form onSubmit={this.handleGameJoin}>
					<input
						onChange={this.changeJoinHandler}
						value={this.state.gameId}
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
            location: 0
			// messages:[],
			// text: '',
		};
	},

	componentDidMount() {
		// socket.on('init', this._initialize);
		// socket.on('send:message', this._messageRecieve);
		socket.on('player:join', this._playerJoined);
		// socket.on('user:left', this._userLeft);
		// socket.on('change:name', this._userChangedName);

		socket.on('game:created', this._gameCreated);
		socket.on('game:joined', this._gameJoined);
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

	_playerJoined(data) {
		var {players} = this.state;
		var {name} = data;
		players.push(name);
		this.setState({players});
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
		this.setState({ _gameId: gameId });
	},

	_gameCreated(gameId) {
		//go to main screen lobby
		this.setState({ ship: true, _gameId: gameId, _gameState: 'lobby' });
	},

	_gameJoined() {
		//player location
		this.setState({ ship: false, _gameState: 'lobby' });
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
                    />;
                    break;
            }
        } else {
            switch(this.state._gameState) {
                case 'started':
                    switch(this.state.location) {
                        case 'weapons':
                            panel = <div><PlayerMenu /><PlayerWeapons /></div>;
                            break;
                        case 'shields':
                            panel = <div><PlayerMenu /><PlayerShields /></div>;
                            break;
                        case 'engine':
                            panel = <div><PlayerMenu /><PlayerEngine /></div>;
                            break;
                        case 'bridge':
                            panel = <div><PlayerMenu /><PlayerBridge /></div>;
                            break;

                    }
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
			<div>
                {panel}
			</div>
		);
	}
});

React.render(<ChatApp/>, document.getElementById('app'));