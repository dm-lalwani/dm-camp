const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const Campground = require('./models/campground');
const Comment = require('./models/comment');
const User = require("./models/user");
const seedDB = require('./seeds');

//App Config
mongoose.connect('mongodb://localhost:27017/dm_camp', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine' , 'ejs');
app.use(express.static(__dirname + '/public'));
//seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});


app.get('/', (req, res) => {
  res.render('landing')
})


//INDEX - show all campgrounds
app.get('/campgrounds', function(req, res){
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else{
			res.render('campgrounds/index',{campgrounds:allCampgrounds});
		}
	})
})

//CREATE - Add new campground to DB
app.post('/campgrounds', function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var newCampground = {name: name, image: image, description: desc}

	// Create a campgrd & save to db
	Campground.create(newCampground, function(err, newlycreated){
		if(err){
			console.log(err);
		}else{
			res.redirect('/campgrounds');
		}
	});
})

//NEW - show form to create new campground
app.get('/campgrounds/new', function(req, res){
	res.render('campgrounds/new');
})

//SHOW - shows more info about one campground
app.get('/campgrounds/:id', function(req, res){
	Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
		if(err){
			console.log(err);
		} else{
			res.render('campgrounds/show', {campground: foundCampground});
		}
	});
	
})

//====================================== COMMENTS ROUTE ==================================================

//NEW - show form to add new comment
app.get('/campgrounds/:id/comments/new',isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		} else{
			res.render('comments/new', {campground: campground})
		}
	});
})

//CREATE - connects the comment to the campground
app.post('/campground/:id/comments',isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		} else{
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				} else{
					campground.comments.push(comment);
					campground.save();
					res.redirect('/campgrounds/' + campground._id);
				}
			});
		}
	});
})

//============================================ AUTH ROUTES =======================================================

// show register form
app.get("/register", function(req, res){
   res.render("register"); 
});
//handle sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/campgrounds"); 
        });
    });
});

// show login form
app.get("/login", function(req, res){
   res.render("login"); 
});
// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});

// logic route
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.listen(port, () => {
  console.log(`The DM's Camp has started at http://localhost:${port}`)
})