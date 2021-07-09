const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middleware/isAuth");
const User = require("../Models/User");
const Transcript = require("../Models/Transcript");
const passport = require("passport");

router.get("/", (req, res) => {
	res.render("auth.ejs", { errorSingUp: null, errorSignIn: null });
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
			res.render("auth.ejs", { errorSingUp: err, errorSignIn: null });
		}
		//console.log(req.user);
		passport.authenticate("local")(req, res, function () {
			//alert("Successful Registration");
			res.render("auth.ejs", { errorSingUp: null, errorSignIn: null });
		});
	});
});
// router.post(
// 	"/signIn",
// 	passport.authenticate("local", {
// 		successRedirect: "/auth/home",
// 		failureRedirect: "/auth",
// 	}),
// 	function (req, res) {
// 		//console.log(req.user);
// 		console.log(req.body);
// 	}
// );

router.post("/signIn", function (req, res, next) {
	passport.authenticate("local", function (err, user, info) {
		if (err) {
			console.log(err);
		}
		if (!user) {
			res.render("auth.ejs", { errorSingUp: null, errorSignIn: "Verify username and password" });
		} else {
			req.logIn(user, function (err) {
				if (err) {
					console.log(err);
				}
				res.redirect("/auth/home");
			});
		}
	})(req, res, next);
});

module.exports = router;
