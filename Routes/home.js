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

router.get("/join/:id", AuthMiddleware, (req, res) => {
	Chats.find({ title: req.params.id }).then((data) => {
		if (data.length > 0) {
			Chats.findOneAndUpdate(
				{ _id: data[0]._id },
				{
					$push: {
						participants: req.user.username,
					},
				}
			)
				.then((data) => {
					res.json({ msg: "User Successfully added" });
				})
				.catch((err) => {
					res.json({ error: "Enter a valid url" });
				});
		} else {
			res.json({ error: "Enter a valid url" });
		}
	});
});

module.exports = router;
