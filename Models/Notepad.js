const mongoose = require("mongoose");

// Schema for Notepad
const NotepadSchema = new mongoose.Schema({
	notes_title: {
		type: String,
	},
	roomId: String,
	participants: [],
	notes: String,
	line_history: [],
});

module.exports = mongoose.model("Notepad", NotepadSchema);
