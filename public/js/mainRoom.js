const roomName = document.getElementById('room-name');
const roomDiv = document.getElementById('room');
const pointDiv = document.getElementById('point')
const usernameDiv = document.getElementById('username-block')

const usersInRoom = document.getElementById('users-in-room')

const roomsContainer = document.getElementById('rooms-container');
const roomsList = document.getElementById('rooms-list');
const logDiv = document.getElementById('log');

let usersLocal = {};
let currentRoom = 'Laguiole';
let isPlaying = false;
let myId;

// Get username and room from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinGame', username);
logDiv.innerText = 'Welcome, ' + username;
usernameDiv.innerText = username;

// join room
function loginRoom(room) {
    // Emit message to server to login room 
    socket.emit('loginRoom', room);
}

socket.on('connect', () => {myId = socket.id;});

socket.on('loginSucceed', (room) => {
    currentRoom = room;
    console.log(room);
    roomName.innerText = room;
    if( room === 'Laguiole') {
	roomDiv.style.display = "none";
    } else {
	roomDiv.style.display = "block";
    }
});

socket.on('loginFailed', (room) => { 
    logDiv.innerText = "Log in failed. " + room + " is currently locked";
});
	  
// Add users to DOM
function outputUsers(db, thisRoomName) {
    console.log("outputUsers", db, thisRoomName);
    usersInRoom.innerHTML =
	db[thisRoomName].users
	.map(e =>
	     e.id !== myId ?
	     `<li class='user notOnVote' onclick='vote("${e.id}");'>${e.username}</li>` : "").join('');
}

function updatePoint( point ) {
    pointDiv.innerText = "your point is " + point;
}

socket.on('lockRoom', (room) => {
    for (let i = 0; i < roomsList.children.length; i ++ ) {
	const roomLi = roomsList.children[ i ];
	if( roomLi.children[0].innerText === room ) {
	    roomLi.classList.add('isLocked');
	    roomLi.classList.remove('isUnLocked');
	}
    }
});

socket.on('unLockRoom', (room) => {
    console.log("unlock room");
    
    for (let i = 0; i < roomsList.children.length; i ++ ) {
	const roomLi = roomsList.children[ i ];
	if( roomLi.children[0].innerText === room ) {
	    roomLi.classList.remove('isLocked');
	    roomLi.classList.add('isUnLocked');
	}
    }
});
	  
// Game stopped
socket.on('currentUsers', (db) => {
    usersLocal = db;
    const list = roomsList.children;
    console.log(db);
    console.log(roomsList.children);
    let innerHTML = "";
    for (const roomName in db) {
	const isLocked = db[roomName].isLocked ? "isLocked" : "isUnLocked";
	innerHTML +=
	    `<li class="room-btn ${isLocked}" onclick="loginRoom('${roomName}')";>
	  <h4 class="room-name">${roomName}</h4>
	  <ul class="room-users-list">`
	    + db[roomName].users.map(e => `<li>${e.username}</li>`).join('') 
	    + "</ul></li>";
    }
    console.log(innerHTML);
    roomsList.innerHTML = innerHTML;
    if( !isPlaying ) outputUsers(db, currentRoom);
});

window.onbeforeunload = () => {
    if( !isPlaying ) socket.emit('stopGame');
};
