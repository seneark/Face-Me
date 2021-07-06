const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
	debug: true,
});
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const AuthMiddleware = require("./middleware/isAuth");
const db = require("./config/keys").mongoURI;

const user = require("./Routes/user");
const notes_ = require("./Routes/notes");
const chats_ = require("./Routes/home");

const Transcript = require("./Models/Transcript");
const Chat = require("./Models/Chats");
const User = require("./Models/User");

mongoose.connect(db, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(
	require("express-session")({
		secret: "any string",
		resave: false,
		saveUninitialized: false,
	})
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	next();
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.use("/auth", user);
app.use("/notes", notes_);
app.use("/home", chats_);

app.get("/", AuthMiddleware, (req, res) => {
	res.redirect(`/${uuidv4()}`);
});

app.get("/:room", AuthMiddleware, (req, res) => {
	res.render("room", { roomId: req.param.room, userName: req.user.username });
});

const add_transcript = (userName, messages_obj) => {
	// console.log(messages_obj);

	const newTranscript = new Transcript({
		username: userName,
		date: new Date(),
	});
	// newTranscript.messages.push(messages_obj[0])

	newTranscript.save().then((data) => {
		// console.log(data);
		Transcript.findOneAndUpdate({ _id: data._id }, { $set: { messages: messages_obj } })
			.then((data) => {
				console.log(data);
			})
			.catch((err) => console.log(err));
	});
};

var Usr = {};

var line_history = {};
var notes = {};
var notes_taken = {};

var messages_obj = {};
io.of("/chat-room").on("connection", (socket) => {
	// Chat Room
});
io.on("connection", (socket) => {
	socket.on("join-room", async (roomId, userId, userName) => {
		console.log("Joining room: " + roomId);
		await socket.join(roomId);
		console.log(socket.id + " now in rooms ", socket.rooms);
		Chat.find({ title: roomId }).then(async (data) => {
			if (data.length > 0) {
				console.log(data);
				if (data[0].participants.indexOf(userName) == -1) {
					await Chat.findOneAndUpdate(
						{ _id: data[0]._id },
						{
							$push: {
								participants: userName,
								messages: {
									type_msg: "join",
									messages: userName + " joined the meeting",
									sender: "Admin",
								},
							},
						}
					);
				}
			} else {
				const newChat = new Chat({
					title: roomId,
				});

				await newChat.save().then(async (data) => {
					await Chat.findOneAndUpdate(
						{ _id: data._id },
						{
							$set: {
								participants: userName,
								messages: {
									type_msg: "join",
									messages: userName + " joined the meeting",
									sender: "Admin",
								},
							},
						}
					);
				});
			}
		});
		await socket.to(roomId).broadcast.emit("user-connected", userId, userName);
		if (!(roomId in Usr)) {
			Usr[roomId] = [];
			messages_obj[roomId] = [];
		}
		// messages_obj[roomId].push({
		// 	type_msg: "join",
		// 	messages: userName + " joined the meeting",
		// 	sender: "Admin",
		// });
		socket.to(roomId).emit("participants", userName + " joined the meeting", "join");
		Usr[roomId].push(userName);
		await socket.on("message", async (message) => {
			// messages_obj[roomId].push({
			// 	type_msg: "message",
			// 	messages: message,
			// 	sender: userName,
			// });
			Chat.findOneAndUpdate(
				{ title: roomId },
				{
					$push: {
						messages: {
							type_msg: "message",
							messages: message,
							sender: userName,
						},
					},
				}
			).then((data) => {
				console.log("success");
			});
			await io.to(roomId).emit("createMessage", message, userName);
		});
		await socket.on("disconnect", () => {
			// messages_obj[roomId].push({
			// 	type_msg: "leave",
			// 	messages: userName + " left the meeting",
			// 	sender: "Admin",
			// });
			Chat.findOneAndUpdate(
				{ title: roomId },
				{
					$push: {
						messages: {
							type_msg: "leave",
							messages: userName + " left the meeting",
							sender: "Admin",
						},
					},
				}
			).then((data) => {
				console.log("success");
			});
			socket.to(roomId).broadcast.emit("user-disconnected", userId, userName);
			socket.to(roomId).emit("participants", userName + " left the meeting", "leave");
			// add_transcript(userName, messages_obj[roomId]);
		});
	});
	socket.on("join-chat", async (roomId) => {
		console.log(roomId);
		await socket.join(roomId);
	});
	socket.on("message", async (message, roomId, userName) => {
		// socket.leaveAll();
		socket.join(roomId);
		console.log("f");
		// Chat.findOneAndUpdate(
		// 	{ title: roomId },
		// 	{
		// 		$push: {
		// 			messages: {
		// 				type_msg: "message",
		// 				messages: message,
		// 				sender: userName,
		// 			},
		// 		},
		// 	}
		// ).then((data) => {
		// 	console.log("success");
		// });
		await io.to(roomId).emit("createMessage", message, userName, roomId);
	});

	// canvas and notes
	socket.on("join-notes", (roomId) => {
		socket.join(roomId);
		if (!(roomId in line_history)) {
			line_history[roomId] = [];
			notes[roomId] = null;
			notes_taken[roomId] = 0;
		}
		socket.emit("startup", {
			notes: notes[roomId],
			notes_taken: notes_taken[roomId],
		});
		if (roomId in line_history)
			for (var i in line_history[roomId]) {
				socket.emit("draw_line", line_history[roomId][i]);
			}
		// add handler for message type "draw_line".
		socket.on("draw_line", function (data) {
			// add received line to history
			line_history[roomId].push(data);
			// send line to all clients
			io.emit("draw_line", data);
		});

		socket.on("clear_canvas", function () {
			line_history[roomId] = [];
			io.emit("clear_canvas");
		});

		socket.on("notes_content", function (data) {
			notes[roomId] = data.notes;
			io.emit("notes_content", data);
		});
	});
});

server.listen(process.env.PORT || 3030);
