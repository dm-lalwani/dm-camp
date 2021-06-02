const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

//App Config
mongoose.connect('mongodb://localhost:27017/dm_camp', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine' , 'ejs')

//Schema Setup or Moongoos/Model config
 var campgroundSchema = new mongoose.Schema({
 	name: String,
 	image: String,
 	description: String
 });

var Campground = mongoose.model('Campground', campgroundSchema);

// Campground.create(
// {
// 	name: 'Mahesh Hills',
// 	image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Tent_camping_along_the_Sulayr_trail_in_La_Taha%2C_Sierra_Nevada_National_Park_%28DSCF5147%29.jpg/1200px-Tent_camping_along_the_Sulayr_trail_in_La_Taha%2C_Sierra_Nevada_National_Park_%28DSCF5147%29.jpg',
// 	description: 'A must visit place for experiencing the Mother Nature'
// }, function(err, campground){
// 	if(err){
// 		console.log(err);
// 	} else{
// 		console.log('Newly created campground');
// 		console.log(campground);
// 	}
// });

app.get('/', (req, res) => {
  res.render('landing')
})

app.get('/campgrounds', function(req, res){
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else{
			res.render('index',{campgrounds:allCampgrounds});
		}
	})
})

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

app.get('/campgrounds/new', function(req, res){
	res.render('new');
})

app.get('/campgrounds/:id', function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			console.log(err);
		} else{
			res.render('show', {campground: foundCampground});
		}
	})
	
})

app.listen(port, () => {
  console.log(`The DM's Camp has started at http://localhost:${port}`)
})