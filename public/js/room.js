const startButton = document.getElementById('start-btn');
const redoButton = document.getElementById('redo-btn');
const timerDiv = document.getElementById("timer");
const topicDiv = document.getElementById("topic");
let interval;
let canVote = false;

console.log(socket);

// Game started
socket.on('gameStart', ({topic, endingTime}) => {
    console.log("my topic is", topic);
    logDiv.innerText = "game Started";
    topicDiv.innerText = topic;
    interval = setTimer(endingTime);
    redoButton.style.display = "block";
    startButton.style.display = "none";
    topicDiv.style.display = "block";
    roomsContainer.style.display = "none";
});

// Game stopped
socket.on('gameStop', () => {
    gameStop();
    logDiv.innerText = "game Stopped";
});

function gameStop() {
    redoButton.style.display = "none";
    startButton.style.display = "block";
    topicDiv.style.display = "none";
    setTimerOff();
    roomsContainer.style.display = "block";
}

socket.on('gameSet', ({killedUser, isCitizenWon, isUserWon, userProperty}) => {
    console.log("game set");
    logDiv.innerText =
	(isUserWon ? "You win" : "You loose")
	+ ".\n Killed " + killedUser.username + ", who were " + killedUser.property     
	+ ".\n" + ((userProperty === "wolf" ) ? "You were the wolf" : "You were citizen");

    console.log(killedUser, isCitizenWon, userProperty);
    gameStop();
});

// Send start
startButton.addEventListener('click', (e) => {
    e.preventDefault();
    socket.emit('startGame');
    console.log("start Game");
});

// Send stopGame
redoButton.addEventListener('click', (e) => {
    if( !confirm("Are you sure to redo?") ) return;
    e.preventDefault();
    socket.emit('stopGame');
});

function setTimerOff() {
    clearInterval( interval );
    timer.innerText = "";
}

function setTimer( countDownDate ) { 
    const interval = setInterval(function() {
	const now = new Date().getTime();
	const distance = countDownDate - now;
	const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((distance % (1000 * 60)) / 1000);
	timerDiv.innerText = minutes + "m " + seconds + "s ";
	if (distance < 0) {
	    console.log("clear interval");
	    canVote = true;
	    clearInterval(interval);
	    timerDiv.innerText = "Times up";
	    for (let i = 0; i < usersInRoom.children.length; i ++) {
		usersInRoom.children[ i ].classList.add("onVote");
	    }
	}
    }, 1000);
    return interval;
}

function vote( id ) {
    console.log("vote");
    if(!canVote) return;
    console.log("vote");
    socket.emit('vote', id);
    canVote = false;
    for (let i = 0; i < usersInRoom.children.length; i ++) {
	usersInRoom.children[ i ].classList.remove("onVote");
    }
}
