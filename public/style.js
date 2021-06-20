$(".HoverState").hide();
var active = false;
var currentX;
var currentY;
var initialX;
var initialY;
var xOffset = 0;
var yOffset = 0;

var container = document.getElementById("video-grid");

container.addEventListener("mousedown", dragStart, false);

function dragStart(e) {
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
		timedelay = 1;
	}
	timedelay = timedelay + 1;
}
$(document).mousemove(function () {
	$(".multi-button").fadeIn();
	$("#header").fadeIn();
	$(".multi-button").style = "";
	timedelay = 1;
	clearInterval(_delay);
	_delay = setInterval(delayCheck, 400);
});
_delay = setInterval(delayCheck, 400);
