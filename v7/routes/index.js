const express = require("express");
const router  = express.Router();
const passport = require("passport");
const User = require("../models/user");

router.get('/', (req, res) => {
  res.render('landing')
})

// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});
//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            res.redirect("register");
        }
        passport.authenticate("local")(req, res, function(){
          req.flash("success", "Welcome to DM's Camp " + user.username);
           res.redirect("/campgrounds"); 
        });
    });
});

// show login form
router.get("/login", function(req, res){
   res.render("login"); 
});
// handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash('success', 'Logged you out');
   res.redirect("/campgrounds");
});



module.exports = router;