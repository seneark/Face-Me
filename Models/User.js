const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// Schema for user and uses passportLocalMongoose
const UserSchema = new mongoose.Schema({
  username: String,
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);
