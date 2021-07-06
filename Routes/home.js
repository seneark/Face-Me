const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middleware/isAuth");
const Chats = require("../Models/Chats");

router.get("/chats", AuthMiddleware, (req, res) => {
	Chats.find({ participants: req.user.username }).then((data) => {
		// console.log(data);
		let rooms = [];
		for (let i = 0; i < data.length; i++) {
			rooms.push(data[i].title);
		}
		res.render("chats", { chats: data, rooms: rooms, UserName: req.user.username });
	});
});

module.exports = router;
