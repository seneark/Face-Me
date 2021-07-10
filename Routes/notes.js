const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middleware/isAuth");
const { v4: uuidv4 } = require("uuid");

// @route   GET notes/
// @desc    redirects to a unique notepad
router.get("/", AuthMiddleware, (req, res) => {
  res.redirect(`notes/create/${uuidv4()}`);
});

// @route   GET notes/create/:room    e.g. notes/create/123-456-789
// @desc    Access a notepad based on room
router.get("/create/:room", AuthMiddleware, (req, res) => {
  res.render("notes", { roomId: req.param.room, UserName: req.user.username });
});

module.exports = router;
