const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middleware/isAuth");
const { v4: uuidv4 } = require("uuid");

router.get("/", AuthMiddleware, (req, res) => {
  res.redirect(`notes/create/${uuidv4()}`);
});
router.get("/create/:room", AuthMiddleware, (req, res) => {
  res.render("notes", { roomId: req.param.room });
});

module.exports = router;
