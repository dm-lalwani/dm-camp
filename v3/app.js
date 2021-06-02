const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const Campground = require('./models/campground');
const seedDB = require('./seeds');

//App Config
mongoose.connect('mongodb://localhost:27017/dm_camp', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine' , 'ejs');
seedDB();

app.get('/', (req, res) => {
  res.render('landing')
})

//INDEX - show all campgrounds
app.get('/campgrounds', function(req, res){
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else{
			res.render('index',{campgrounds:allCampgrounds});
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
	res.render('new');
})

//SHOW - shows more info about one campground
app.get('/campgrounds/:id', function(req, res){
	Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
		if(err){
			console.log(err);
		} else{
			res.render('show', {campground: foundCampground});
		}
	});
	
})

app.listen(port, () => {
  console.log(`The DM's Camp has started at http://localhost:${port}`)
})