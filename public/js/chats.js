// $(".messages").animate({ scrollTop: $(document).height() }, "fast");
let prev = "";
let foo = "";
const socket = io("/");

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
		console.log(message);
		socket.emit("message", message, foo, user);

		// $(".message-input input").val(null);
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
});

let rooms_joined = [];

function showMsg(val) {
	foo = val;
	if (rooms_joined.indexOf(foo) == -1) {
		rooms_joined.push(foo);
		socket.emit("join-chat", foo);
	}
	if (prev.length === 0 || prev === foo) {
		$("#wrap-" + foo).addClass("active");
		prev = foo;
		$("#messages-" + foo).css("display", "block");
		$("#messages-" + foo).animate({ scrollTop: $("#messages-" + foo)[0].scrollHeight }, "fast");
	} else {
		$("#wrap-" + foo).addClass("active");
		$("#wrap-" + prev).removeClass("active");
		$("#messages-" + foo).css("display", "block");
		$("#messages-" + prev).css("display", "none");
		$("#messages-" + foo).animate({ scrollTop: $("#messages-" + foo)[0].scrollHeight }, "fast");
		prev = foo;
	}
}

socket.on("createMessage", (message, userName, roomId) => {
	if (userName === user) $('<li class="sent"><p>' + message + "</p></li>").appendTo($("#messages-" + roomId + " ul"));
	else $('<li class="sent"><p>' + message + "</p></li>").appendTo($("#messages-" + roomId + " ul"));
});
