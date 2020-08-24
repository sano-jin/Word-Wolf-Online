const db = {'Laguiole': {"users": [], "isLocked": false},
	       'Mozzarella': {"users": [], "isLocked": false},
	       'Cheddar': {"users": [], "isLocked": false},
	       'Emmental': {"users": [], "isLocked": false}};

// Join user to chat
function userJoin(id, username, point) {
    const room = 'Laguiole';
    const user = {id,
		  "username": escapeHTML(username),
		  "point": 0,
		  "votedN": 0,
		  "hasVoted": false,
		  "property": "citizen"};
    if(!db[room]) db[room].users = [];
    db[room].users.push(user);
    console.log(db);
    return user;
}

function escapeHTML(s) { 
    return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

// Get current user
function getCurrentUser(id) {
    console.log("getCurrentUser");
    console.log(db);
    for (const roomName in db) {
	const foundUser = db[roomName].users.find(user => user.id === id);
	if(foundUser) return foundUser;
    }
}

// User leaves chat
function userLeave(id) {
    console.log("leave");
    for (const roomName in db) {
	const index = db[roomName].users.findIndex(user => user.id === id);
	if(index !== -1) {
	    const user = db[roomName].users.splice(index, 1)[0];
	    console.log(db);
	    return user;
	}
    }
    console.log("Error: cannot find user", id, db);
}

function lockRoom(room, isLocked){
    db[room].isLocked = isLocked;
    if( isLocked ) {
	db[room].users.map(u => {
	    u.votedN = 0;
	    u.hasVoted = false;
	});
    }
}

// User changes room
function userChangeRoom(id, room) {
    if( db[room].isLocked ) return; // is locked
    
    for (const roomName in db) {
	const index = db[roomName].users.findIndex(user => user.id === id);
	if(index !== -1) {
	    const user = db[roomName].users.splice(index, 1)[0];
	    db[room].users.push(user);
	    console.log(db);
	    return roomName;
	}
    }
}

// Get room
function getRoom(id) {
    console.log(db);
    for (const roomName in db) {
	const index = db[roomName].users.findIndex(user => user.id === id);
	if(index !== -1) return roomName;
    }
}

// Get room db
function getRoomUsers(id) {
    console.log(db);
    for (const roomName in db) {
	const index = db[roomName].users.findIndex(user => user.id === id);
	if(index !== -1) return db[roomName].users;
    }
}

// Get all db
function getAllUsers() {
    console.log(db);
    return db;
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    userChangeRoom,
    getRoom,
    getRoomUsers,
    getAllUsers,
    lockRoom,
};
