const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");

const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;
var receivingCaptions = false;
var sendingCaptions = false;
var VideoChatRecognition = undefined;

var isChats = false;
var addVideoCount = 0;
var junkVideoCount = 0;

backBtn.addEventListener("click", () => {
	document.querySelector(".main__left").style.display = "flex";
	document.querySelector(".main__left").style.flex = "1";
	document.querySelector(".main__right").style.display = "none";
	document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
	if (isChats === false) {
		document.querySelector(".main__right").style.display = "flex";
		document.querySelector(".main__left").style.flex = "0.88";
		isChats = true;
	} else {
		document.querySelector(".main__right").style.display = "none";
		document.querySelector(".main__left").style.flex = "1";
		isChats = false;
	}
});

var allUsers = [];

const user = prompt("Enter your name");

var peer = new Peer(undefined, {
	path: "/peerjs",
	host: "/",
	port: "3030",
});

let myVideoStream;
navigator.mediaDevices
	.getUserMedia({
		audio: true,
		video: true,
	})
	.then((stream) => {
		myVideoStream = stream;
		console.log("then");
		addVideoStream(myVideo, stream, user);
		peer.on("call", (call) => {
			call.answer(stream);
			const video = document.createElement("video");
			call.on("stream", (userVideoStream) => {
				if (addVideoCount % 2 != 0) {
					addVideoStream(video, userVideoStream, allUsers[parseInt(addVideoCount / 2)]);
				}
				addVideoCount++;
			});
		});

		socket.on("user-connected", (userId, name) => {
			connectToNewUser(userId, stream, name);
		});
	});

const connectToNewUser = (userId, stream, name) => {
	const call = peer.call(userId, stream);
	const video = document.createElement("video");
	call.on("stream", (userVideoStream) => {
		if (junkVideoCount % 2 != 0) addVideoStream(video, userVideoStream, name);
		junkVideoCount++;
	});
};

peer.on("open", (id) => {
	socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream, name) => {
	var main = document.createElement("div");
	main.className = "main-cont";
	main.draggable = "true";
	video.srcObject = stream;
	var bod = document.createElement("div");
	bod.className = "overlay";
	var tag = document.createElement("p"); // <p></p>
	var text = document.createTextNode(name);
	tag.appendChild(text);
	tag.style.cssText = "color:white";
	bod.appendChild(tag);
	main.appendChild(video);
	main.appendChild(bod);
	video.addEventListener("loadedmetadata", () => {
		video.play();
		videoGrid.append(main);
	});
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
	if (text.value.length !== 0) {
		socket.emit("message", text.value);
		text.value = "";
	}
});

text.addEventListener("keydown", (e) => {
	if (e.key === "Enter" && text.value.length !== 0) {
		socket.emit("message", text.value);
		text.value = "";
	}
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
const captionButtontext = $("#caption-button-text");
const captionText = $("#remote-video-text");
muteButton.addEventListener("click", () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false;
		html = `<i class="fas fa-microphone-slash"></i>`;
		muteButton.classList.toggle("background__red");
		muteButton.innerHTML = html;
	} else {
		myVideoStream.getAudioTracks()[0].enabled = true;
		html = `<i class="fas fa-microphone"></i>`;
		muteButton.classList.toggle("background__red");
		muteButton.innerHTML = html;
	}
});

stopVideo.addEventListener("click", () => {
	const enabled = myVideoStream.getVideoTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false;
		html = `<i class="fas fa-video-slash"></i>`;
		stopVideo.classList.toggle("background__red");
		stopVideo.innerHTML = html;
	} else {
		myVideoStream.getVideoTracks()[0].enabled = true;
		html = `<i class="fas fa-video"></i>`;
		stopVideo.classList.toggle("background__red");
		stopVideo.innerHTML = html;
	}
});

inviteButton.addEventListener("click", (e) => {
	prompt("Copy this link and send it to people you want to meet with", window.location.href);
});

function requestToggleCaptions() {
	if (receivingCaptions) {
		captionText.text("").fadeOut();
		captionButtontext.text("Start Live Caption");
		receivingCaptions = false;
	} else {
		Snackbar.show({
			text: "This will write out whatever is being said.",
			width: "400px",
			pos: "bottom-center",
			actionTextColor: "#616161",
			duration: 10000,
		});
		captionButtontext.text("End Live Caption");
		receivingCaptions = true;
	}
	toggleSendCaptions();
}

function toggleSendCaptions() {
	if (sendingCaptions) {
		sendingCaptions = false;
		VideoChatRecognition.stop();
	} else {
		startSpeech();
		sendingCaptions = true;
	}
}

function startSpeech() {
	try {
		var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		VideoChatRecognition = new SpeechRecognition();
	} catch (e) {
		sendingCaptions = false;
		recieveCaptions("notusingchrome");
		console.log(e);
		return;
	}
	VideoChatRecognition.continuous = true;
	VideoChatRecognition.interimResults = true;
	var finalTranscript;
	VideoChatRecognition.onresult = (event) => {
		let interimTranscript = "";
		for (let i = event.resultIndex, len = event.results.length; i < len; i++) {
			var transcript = event.results[i][0].transcript;
			if (event.results[i].isFinal) {
				finalTranscript += transcript;
			} else {
				interimTranscript += transcript;
				var charsToKeep = interimTranscript.length % 100;
				recieveCaptions(interimTranscript.substring(interimTranscript.length - charsToKeep));
			}
		}
	};
	VideoChatRecognition.onend = function () {
		if (sendingCaptions) {
			startSpeech();
		} else {
			VideoChatRecognition.stop();
		}
	};
	VideoChatRecognition.start();
}

function recieveCaptions(captions) {
	if (receivingCaptions) {
		captionText.text("").fadeIn();
	} else {
		captionText.text("").fadeOut();
	}
	if (captions === "notusingchrome") {
		alert("Other caller must be using chrome for this feature to work. Live Caption turned off.");
		receivingCaptions = false;
		captionText.text("").fadeOut();
		captionButtontext.text("Start Live Caption");
		return;
	}
	console.log(captions);
	captionText.text(captions);
}

socket.on("createMessage", (message, userName) => {
	messages.innerHTML =
		messages.innerHTML +
		`<div class="message">
        <span> <b><span> ${userName === user ? "me" : userName}<br/></span> </b>${message}</span>
    </div>`;
});

socket.on("UserName", (Users) => {
	allUsers = Users;
});

socket.on("requestToggleCaptions", () => toggleSendCaptions());
socket.on("recieveCaptions", (captions) => recieveCaptions(captions));
