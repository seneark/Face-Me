const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
io.set("origins", "*:*");
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
	debug: true,
});
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const AuthMiddleware = require("./middleware/isAuth");
const db = require("./config/keys").mongoURI;

// Importing all the Routes
const user = require("./Routes/user");
const notes_ = require("./Routes/notes");
const chats_ = require("./Routes/home");

// Importing Models
const Chat = require("./Models/Chats");
const User = require("./Models/User");
const Notepad = require("./Models/Notepad");

// Database connection
mongoose.connect(db, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Middleware for json parsing and ejs engine
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Middle ware for sessions
app.use(
	require("express-session")({
		secret: "any string",
		resave: false,
		saveUninitialized: false,
	})
);

// Middleware for passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	next();
});

// path for peerjs
app.use("/peerjs", peerServer);
app.use(express.static("public"));

// base path for all the route
app.use("/auth", user);
app.use("/notes", notes_);
app.use("/home", chats_);

app.get("/", AuthMiddleware, (req, res) => {
	res.redirect(`/${uuidv4()}`);
});

app.get("/:room", AuthMiddleware, (req, res) => {
	res.render("room", { roomId: req.param.room, userName: req.user.username });
});

// variable used for storing data on canvas
let line_history = {};
let notes = {};
let notes_taken = {};
let notes_title = {};

io.on("connection", (socket) => {
	// Socket for Video Room
	socket.on("join-room", async (roomId, userId, userName) => {
		await socket.join(roomId);

		// Updates the chats data on the backend to push all the new messages
		Chat.find({ title: roomId }).then(async (data) => {
			if (data.length > 0) {
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
					name: roomId,
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

		// event triggered when a new user joins video room
		await socket.to(roomId).broadcast.emit("user-connected", userId, userName);

		socket.to(roomId).emit("participants", userName + " joined the meeting", "join");
		await socket.on("message", async (message) => {
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
			).then((data) => {});
			await io.to(roomId).emit("createMessage", message, userName);
		});
		await socket.on("disconnect", () => {
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
			).then((data) => {});

			// Triggered when user disconnects and remove the user from video room
			socket.to(roomId).broadcast.emit("user-disconnected", userId, userName);
			socket.to(roomId).emit("participants", userName + " left the meeting", "leave");
		});
	});

	// Chat room
	// File containing emit : public/js/chats.js
	socket.on("join-chat", async (roomId) => {
		await socket.join(roomId);
	});
	// Triggered when a new message is sent
	socket.on("message-chat-room", async (message, roomId, userName) => {
		socket.join(roomId);
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
		).then((data) => {});
		await io.to(roomId).emit("createMessage", message, userName, roomId);
	});

	// When Creating a new chat
	socket.on("create-chat", async (chats_title, userName) => {
		const newChat = new Chat({
			name: chats_title,
			title: uuidv4(),
		});

		await newChat.save().then(async (data) => {
			await Chat.findOneAndUpdate(
				{ _id: data._id },
				{
					$set: {
						participants: userName,
					},
				}
			);
		});
	});
	// triggered when renaming the chat
	socket.on("rename-chat", async (roomId, name) => {
		Chat.findOneAndUpdate(
			{ title: roomId },
			{
				$set: {
					name: name,
				},
			}
		).then((data) => {});
		io.to(roomId).emit("rename-chat", roomId, name);
	});

	// canvas and notes
	// File containing emit :-
	// canvas  : /public/js/drawing.js
	// notes : /public/js/notes.js
	socket.on("join-notes", async (roomId, userName) => {
		socket.join(roomId);

		// initializes the notes and line history with previous session
		if (!(roomId in line_history)) {
			line_history[roomId] = [];
			notes[roomId] = null;
			notes_taken[roomId] = 0;
			notes_title[roomId] = "";
		}
		await Notepad.find({ roomId: roomId }).then(async (data) => {
			if (data.length > 0) {
				if (data[0].participants.indexOf(userName) == -1) {
					await Notepad.findOneAndUpdate(
						{ roomId: roomId },
						{
							$push: {
								participants: userName,
							},
						}
					).then((data) => {});
				}
				if (notes[roomId] === null) {
					notes_title[roomId] = data[0].notes_title;
					line_history[roomId] = data[0].line_history;
					notes[roomId] = data[0].notes;
				}
			} else {
				const newNotepad = new Notepad({
					roomId: roomId,
				});
				await newNotepad.save().then((data) => {
					Notepad.findOneAndUpdate(
						{ roomId: roomId },
						{
							$push: {
								participants: userName,
							},
						}
					).then((data) => {});
				});
			}
		});

		socket.emit("startup", {
			notes: notes[roomId],
			notes_taken: notes_taken[roomId],
			notes_title: notes_title[roomId],
		});
		if (roomId in line_history)
			for (let i in line_history[roomId]) {
				socket.emit("draw_line", line_history[roomId][i]);
			}
		// add handler for message type "draw_line".
		socket.on("draw_line", function (data) {
			// add received line to history
			line_history[roomId].push(data);
			// send line to all clients
			io.to(roomId).emit("draw_line", data);
		});

		socket.on("clear_canvas", function () {
			line_history[roomId] = [];
			io.to(roomId).emit("clear_canvas");
		});

		socket.on("notes_content", function (data) {
			notes[roomId] = data.notes;
			io.to(roomId).emit("notes_content", data);
		});

		socket.on("title_content", function (data) {
			notes_title[roomId] = data.notes_title;
			io.to(roomId).emit("title_content", data);
		});

		// adds all the data to database upon disconnect
		socket.on("disconnect", function () {
			Notepad.findOneAndUpdate(
				{ roomId: roomId },
				{
					$set: {
						line_history: line_history[roomId],
						notes: notes[roomId],
						notes_title: notes_title[roomId],
					},
				}
			).then((data) => {});
		});
	});
});

server.listen(process.env.PORT || 3030);
