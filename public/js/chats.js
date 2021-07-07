// $(".messages").animate({ scrollTop: $(document).height() }, "fast");
let prev = "";
let foo = "";
const socket = io("/");
let rooms_joined = 0;

$(document).ready(function () {
	$(".messages").animate({ scrollTop: $(document).height() }, "fast");
	$("#profile-img").click(function () {
		$("#status-options").toggleClass("active");
	});

	$(".expand-button").click(function () {
		$("#profile").toggleClass("expanded");
		$("#contacts").toggleClass("expanded");
	});

	$("#status-options ul li").click(function () {
		$("#profile-img").removeClass();
		$("#status-online").removeClass("active");
		$("#status-away").removeClass("active");
		$("#status-busy").removeClass("active");
		$("#status-offline").removeClass("active");
		$(this).addClass("active");

		if ($("#status-online").hasClass("active")) {
			$("#profile-img").addClass("online");
		} else if ($("#status-away").hasClass("active")) {
			$("#profile-img").addClass("away");
		} else if ($("#status-busy").hasClass("active")) {
			$("#profile-img").addClass("busy");
		} else if ($("#status-offline").hasClass("active")) {
			$("#profile-img").addClass("offline");
		} else {
			$("#profile-img").removeClass();
		}

		$("#status-options").removeClass("active");
	});

	function newMessage() {
		message = $(".message-input input").val();
		if ($.trim(message) == "") {
			return false;
		}
		// console.log(message);
		socket.emit("message-chat-room", message, foo, user);

		$(".message-input input").val(null);
		$("#messages-" + foo).animate({ scrollTop: $("#messages-" + foo)[0].scrollHeight }, "fast");
	}

	$(".submit").click(function () {
		newMessage();
	});

	$(window).on("keydown", function (e) {
		if (e.which == 13) {
			newMessage();
			return false;
		}
	});

	if (rooms_joined == 0) {
		for (let i = 0; i < Chats.length; i++) {
			socket.emit("join-chat", Chats[i]);
			rooms_joined = 1;
		}
	}
});

function createChat() {
	let chats_title = prompt("Enter the name of Chat(Leave black if pressed accidentally)");
	console.log(chats_title);
	if (chats_title.length > 0) socket.emit("create-chat", chats_title, user);
	setTimeout(function () {
		location.reload();
	}, 1000);
}

let receivingCaptions = false;
let sendingCaptions = false;
let VideoChatRecognition = undefined;
let mic_icon = $("#mic-status");
let showInfo = false;

// Speech to text
function requestToggleCaptions() {
	if (receivingCaptions) {
		mic_icon.removeClass("fa-microphone");
		mic_icon.addClass("fa-microphone-slash");
		receivingCaptions = false;
	} else {
		Snackbar.show({
			text: "This Displays Captions but only in Chrome window.",
			width: "400px",
			pos: "bottom-center",
			actionTextColor: "#616161",
			duration: 10000,
		});
		mic_icon.addClass("fa-microphone");
		mic_icon.removeClass("fa-microphone-slash");
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
	if (captions === "notusingchrome") {
		alert("Other caller must be using chrome for this feature to work. Live Caption turned off.");
		receivingCaptions = false;
		captionText.text("").fadeOut();
		captionButtontext.text("Start Live Caption");
		return;
	}

	let junk = $(".message-input input").val();
	$(".message-input input").val(captions);
}

function toggleInfo() {
	if (showInfo == true) {
		$("#info-" + prev).css("display", "none");
		showInfo = false;
	} else {
		$("#info-" + prev).css("display", "block");
		showInfo = true;
	}
}

function showMsg(val) {
	foo = val;
	// console.log(Chats);

	if (prev.length === 0 || prev === foo) {
		$("#wrap-" + foo).addClass("active");
		prev = foo;
		$("#messages-" + foo).css("display", "block");
		$("#messages-" + foo).animate({ scrollTop: $("#messages-" + foo)[0].scrollHeight }, "fast");
	} else {
		showInfo = false;
		$("#wrap-" + foo).addClass("active");
		$("#wrap-" + prev).removeClass("active");
		$("#info-" + prev).css("display", "none");
		$("#messages-" + foo).css("display", "block");
		$("#messages-" + prev).css("display", "none");
		$("#messages-" + foo).animate({ scrollTop: $("#messages-" + foo)[0].scrollHeight }, "fast");
		prev = foo;
	}
}

function share() {
	Snackbar.show({
		text: "Here is the join link for your call: " + window.location.origin + "/home/join/" + foo,
		actionText: "Copy Link",
		width: "950px",
		pos: "top-center",
		actionTextColor: "#616161",
		duration: 500000,
		backgroundColor: "#16171a",
		onActionClick: function (element) {
			// Copy url to clipboard, this is achieved by creating a temporary element,
			// adding the text we want to that element, selecting it, then deleting it
			const copyContent = window.location.origin + "/home/join/" + foo;
			$('<input id="some-element">').val(copyContent).appendTo("body").select();
			document.execCommand("copy");
			const toRemove = document.querySelector("#some-element");
			toRemove.parentNode.removeChild(toRemove);
			Snackbar.close();
		},
	});
}

function renameChat() {
	const name = prompt("Enter the new name");
	socket.emit("rename-chat", foo, name);
}
socket.on("rename-chat", (roomId, name) => {
	$(".chats-title-" + roomId).text(name);
});

socket.on("createMessage", (message, userName, roomId) => {
	if (userName === user) $('<li class="sent"><p>' + message + "</p></li>").appendTo($("#messages-" + roomId + " ul"));
	else
		$('<li class="replies"><p><strong>' + userName + "</strong>: " + message + "</p></li>").appendTo(
			$("#messages-" + roomId + " ul")
		);
	if (foo.length > 0) $("#messages-" + foo).animate({ scrollTop: $("#messages-" + foo)[0].scrollHeight }, "fast");
});
