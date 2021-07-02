const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middleware/isAuth");
const User = require("../Models/User");
const Transcript = require("../Models/Transcript");
const passport = require("passport");

router.get("/", (req, res) => {
	res.render("auth.ejs");
});
router.get("/home", AuthMiddleware, async (req, res) => {
	res.render("home.ejs", { userName: req.user.username });
});
router.get("/transcript", AuthMiddleware, (req, res) => {
	Transcript.find({ username: req.user.username }).then((data) => {
		console.log(data);
		res.render("transcript.ejs", { list: data });
	});
});

router.post("/signUp", (req, res) => {
	const newUser = new User({
		username: req.body.username,
		email: req.body.email,
	});
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			console.log(err);
			res.redirect("/auth");
		}
		//console.log(req.user);
		passport.authenticate("local")(req, res, function () {
			//alert("Successful Registration");
			res.redirect("/auth");
		});
	});
});
router.post(
	"/signIn",
	passport.authenticate("local", {
		successRedirect: "/auth/home",
		failureRedirect: "/auth",
	}),
	function (req, res) {
		//console.log(req.user);
		console.log(req.body);
	}
);

module.exports = router;
