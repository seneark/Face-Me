const mongoose = require("mongoose");

const TranscriptSchema = new mongoose.Schema({
	username: String,
	messages: [
		{
			type_msg: String,
			messages: String,
			sender: String,
		},
	],
	date: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = mongoose.model("Transcript", TranscriptSchema);
