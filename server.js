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

const User = require("./Models/User");

mongoose.connect("mongodb://127.0.0.1:27017/Face-Me", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

var Usr = {};

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.param.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", async (roomId, userId, userName) => {
    console.log("Joining room: " + roomId);
    await socket.join(roomId);
    console.log(socket.id + " now in rooms ", socket.rooms);
    await socket.to(roomId).broadcast.emit("user-connected", userId, userName);
    if (!(roomId in Usr)) {
      Usr[roomId] = [];
    }
    Usr[roomId].push(userName);
    io.to(roomId).emit("UserName", Usr[roomId]);
    await socket.on("message", async (message) => {
      await io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

server.listen(process.env.PORT || 3030);
