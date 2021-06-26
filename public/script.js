const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");

const showChat = document.querySelector("#showChat");
const endBtn = document.querySelector("#endCall");
myVideo.muted = true;

// variable for Captions
let receivingCaptions = false;
let sendingCaptions = false;
let VideoChatRecognition = undefined;

// whether the chats are shown ot not
let isChats = false;
let addVideoCount = 0;
let junkVideoCount = 0;

// variable for peers
let myID;
let UserName;
const peers_connected = {};

endBtn.addEventListener("click", () => {
  let host = window.location.host;
  let protocol = window.location.protocol;
  window.location.replace(protocol + "//" + host + "/auth/home");
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

const user = USERNAME;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "face-me-engage.herokuapp.com",
  port: "443",
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
    const main = document.createElement("div");
    addVideoStream(main, myVideo, stream, user);
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      const main = document.createElement("div");
      call.on("stream", (userVideoStream) => {
        console.log(call.metadata.userName);
        if (addVideoCount % 2 != 0) {
          addVideoStream(main, video, userVideoStream, call.metadata.userName);
        }
        addVideoCount++;
      });
      peers_connected[call.metadata.id] = main;
    });

    socket.on("user-connected", (userId, name) => {
      connectToNewUser(userId, stream, name);
    });

    socket.on("user-disconnected", (userId) => {
      if (peers_connected[userId]) peers_connected[userId].remove();
    });
  });

const connectToNewUser = (userId, stream, name) => {
  const call = peer.call(userId, stream, {
    metadata: { id: myID, userName: UserName },
  });
  const video = document.createElement("video");
  const main = document.createElement("div");
  call.on("stream", (userVideoStream) => {
    if (junkVideoCount % 2 != 0)
      addVideoStream(main, video, userVideoStream, name);
    junkVideoCount++;
  });

  peers_connected[userId] = main;
};

peer.on("open", (id) => {
  let room_id = window.location.pathname;
  myID = id;
  UserName = user;
  socket.emit("join-room", room_id.split("/")[1].toString(), id, user);
});

const addVideoStream = (main, video, stream, name) => {
  main.className = "main-cont";
  main.draggable = "true";
  video.srcObject = stream;
  const bod = document.createElement("div");
  bod.className = "overlay";
  const tag = document.createElement("p"); // <p></p>
  const text = document.createTextNode(name);
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
  Snackbar.show({
    text: "Here is the join link for your call: " + window.location.href,
    actionText: "Copy Link",
    width: "950px",
    pos: "top-center",
    actionTextColor: "#616161",
    duration: 500000,
    backgroundColor: "#16171a",
    onActionClick: function (element) {
      // Copy url to clipboard, this is achieved by creating a temporary element,
      // adding the text we want to that element, selecting it, then deleting it
      const copyContent = window.location.href;
      $('<input id="some-element">').val(copyContent).appendTo("body").select();
      document.execCommand("copy");
      const toRemove = document.querySelector("#some-element");
      toRemove.parentNode.removeChild(toRemove);
      Snackbar.close();
    },
  });
});

function requestToggleCaptions() {
  if (receivingCaptions) {
    captionText.text("").fadeOut();
    captionButtontext.text("Start Live Caption");
    receivingCaptions = false;
  } else {
    Snackbar.show({
      text: "This Displays Captions but only in Chrome window.",
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
    var SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
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
        recieveCaptions(
          interimTranscript.substring(interimTranscript.length - charsToKeep)
        );
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
    alert(
      "Other caller must be using chrome for this feature to work. Live Caption turned off."
    );
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
        <span> <b><span> ${
          userName === user ? "Me" : userName
        }<br/></span> </b>${message}</span>
    </div>`;
});

socket.on("requestToggleCaptions", () => toggleSendCaptions());
socket.on("recieveCaptions", (captions) => recieveCaptions(captions));
