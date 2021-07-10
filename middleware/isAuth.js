// checking if the user is authenticated or not
module.exports = (req,res,next) => {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/auth");
}
