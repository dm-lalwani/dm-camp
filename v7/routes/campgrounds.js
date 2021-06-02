const express = require("express");
const router  = express.Router();
const Campground = require("../models/campground");
const middleware = require('../middleware');

//INDEX - show all campgrounds
router.get('/', function(req, res){
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else{
			res.render('campgrounds/index',{campgrounds:allCampgrounds});
		}
	})
})

//CREATE - Add new campground to DB
router.post('/', middleware.isLoggedIn, function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name: name, image: image, description: desc, author: author}

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
router.get('/new', middleware.isLoggedIn, function(req, res){
	res.render('campgrounds/new');
})

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT Campground Route
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			console.log(err);
		} else{
			res.render('campgrounds/edit', {campground: foundCampground});
		}
	});
})

//UPDATE Campground
router.put('/:id', middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			console.log(err);
		} else{
			res.redirect('/campgrounds/' + req.params.id);
		}
	})
})

//DESTROY Campground
router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
		} else{
			res.redirect('/campgrounds');
		}
	})
})




module.exports = router;