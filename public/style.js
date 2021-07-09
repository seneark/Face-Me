$(".HoverState").hide();
var active = false;
var currentX;
var currentY;
var initialX;
var initialY;
var xOffset = 0;
var yOffset = 0;

var container = document.getElementById("video-grid");

function convert_to_percentage($el) {
	var $parent = $el.parent();

	$el.css({
		left: (parseInt($el.position().left) / $parent.width()) * 100 + "%",
		top: (parseInt($el.position().top) / $parent.outerHeight()) * 100 + "%",
		width: ($el.width() / $parent.width()) * 100 + "%",
		height: ($el.height() / $parent.outerHeight()) * 100 + "%",
	});
}

container.addEventListener("mousedown", dragStart, false);
function redirectHome() {
	window.location = window.location.origin + "/auth/home";
}
function dragStart(e) {
	$("#screen-title").resizable();
	$(".main-cont").draggable({
		containment: ".main",
	});
}

$(document).ready(function () {
	$(".hoverButton").mouseover(function () {
		$(".HoverState").hide();
		$(this).next().show();
	});
	$(".hoverButton").mouseout(function () {
		$(".HoverState").hide();
	});
});

var timedelay = 1;
function delayCheck() {
	if (timedelay === 4) {
		$(".multi-button").fadeOut();
		$(".header__back").fadeOut();
		timedelay = 1;
	}
	timedelay = timedelay + 1;
}
$(document).mousemove(function () {
	$(".multi-button").fadeIn();
	$(".header__back").fadeIn();
	$("#header").fadeIn();
	$(".multi-button").style = "";
	$(".header__back").style = "";
	timedelay = 1;
	clearInterval(_delay);
	_delay = setInterval(delayCheck, 400);
});
_delay = setInterval(delayCheck, 400);
