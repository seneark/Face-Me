const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
	title: {
		type: String,
	},
	name: String,
	participants: [],
	messages: [
		{
			type_msg: String,
			messages: String,
			sender: String,
		},
	],
});

module.exports = mongoose.model("Message", MessageSchema);
