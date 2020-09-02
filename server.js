const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io')
const {
    userJoin,
    getCurrentUser,
    userLeave,
    userChangeRoom,
    getRoom,
    getRoomUsers,
    getAllUsers,
    lockRoom,
  } = require('./utils/users');
const getTopics = require('./topics/topics');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Run when client connects
io.on('connection', socket => {
    // Join our playground
    socket.on('joinGame', (username) => {
	console.log(username, "has joined the game");
	userJoin(socket.id, username);
	io.emit('currentUsers', getAllUsers() );
    });

    // Login room
    socket.on('loginRoom', (room) => {
	console.log(socket.id);
	const user = getCurrentUser(socket.id);
	if( user ) {
	    const prevRoomName = userChangeRoom(socket.id, room);
	    if( prevRoomName ) {
		console.log( user, "has login the room", room );
		// socket.leave( prevRoomName );
		// socket.join( room );
		socket.emit('loginSucceed', room);
		io.emit('currentUsers', getAllUsers() );
	    } else {
		socket.emit('loginFailed', room);
	    }
	} 
    });

    // Runs when clients disconnects
    socket.on('disconnect', () => {
	const user = userLeave(socket.id);
	console.log(user, 'disconnected');
	io.emit('currentUsers', getAllUsers() );
    });

    socket.on('vote', id => {
	const userTobeVoted = getCurrentUser(id);
	const userToVote = getCurrentUser(socket.id);
	userTobeVoted.votedN ++;
	userToVote.hasVoted = true;
	const room = getRoom(id);
	console.log(userToVote, "has voted");
	const usersInRoom = getRoomUsers(socket.id);
	if( usersInRoom.every( u => u.hasVoted) ){
	    console.log("game set");
	    lockRoom(room, false);

	    const sortedUsers = usersInRoom.sort((a, b) => b.votedN - a.votedN);
	    console.log(sortedUsers);

	    const killedUser = sortedUsers[0];
	    const isCitizenWon = (killedUser.property === "wolf");
	    console.log(killedUser);
	    
	    usersInRoom.map(u => io.to(u.id).emit('gameSet', {
		killedUser,
		isCitizenWon,
		"isUserWon": (killedUser.property !== u.property),
		"userProperty": u.property 
	    }));
	    io.emit('unLockRoom', room);	    
	}
    });
    
    // Start game
    socket.on('startGame', () => {
	console.log("start game");
	console.log("socket.id is", socket.id);	
	const user = getCurrentUser(socket.id);
	console.log(user);

	if(user) {
	    const room = getRoom(socket.id);
	    console.log( "lock room ", room );
	    io.emit('lockRoom', room );
	    lockRoom(room, true);
	    const endingTime = new Date().getTime() + 1000 * 60 * 5;
	    const usersInRoom = getRoomUsers(user.id);
	    const wolf_i = Math.floor(Math.random() * usersInRoom.length);
	    const topics = getTopics();
	    console.log(room, "has started the game");
	    console.log("topics is", topics);
	    console.log("wolf is", usersInRoom[wolf_i].username);
	    
	    for (const i in usersInRoom) {
		console.log(i, wolf_i, i == wolf_i);
		const topic = (i == wolf_i) ? topics.wolfTopic : topics.citizenTopic;
		usersInRoom[ i ].property = (i == wolf_i) ? "wolf" : "citizen";
		io.to( usersInRoom[i].id )
		    .emit('gameStart', {topic, endingTime});
	    }
	}
    });

    // stop game
    socket.on('stopGame', () => {
	const user = getCurrentUser(socket.id);
	if(user) {
	    const room = getRoom(user.id);
	    lockRoom(room, false);
	    const usersInRoom = getRoomUsers(user.id);
	    usersInRoom.map(u => io.to(u.id).emit('gameStop'));
	    io.emit('unLockRoom', room);
	}
    });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


