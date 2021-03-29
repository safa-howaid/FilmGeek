const express = require('express');
const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const Movie = require("../data/models/movieModel")
const Person = require("../data/models/personModel")
const Review = require("../data/models/reviewModel")

// Create the router
let router = express.Router();

router.get('/', displayMovieSearchPage)
router.get('/:id', sendMovie)

// Load movie from database when given movie id
router.param("id", function(request, response, next, id) {
    let oid;
    console.log("Finding movie by ID: " + id);

	try{
		oid = new ObjectId(id);
	}catch(err){
		console.log(err);
		res.status(404).send("That movie does not exist.");
		return;
	}

    Movie.findById(oid)
    .populate("actors", "name")
    .populate("directors", "name")
    .populate("writers", "name")
    .populate("reviews")
	.exec(function(err, result){
		if(err){
			console.log(err);
			response.status(500).send("Error reading movie data.");
			return;
		}
		
		if(!result){
			response.status(404).send("That movie does not exist.");
			return;
		}
		console.log("Result:");
		console.log(result);
		response.movie = result;
		next();
	});
})

// Send a single movie page/object
function sendMovie(request, response) {
    // Send rendered movie page or movie json data
    response.format({
		"text/html": () => {response.render("../views/pages/movie", {movie: response.movie})},
		"application/json": () => {response.status(200).json(response.movie)}
	});
	next();
}

function displayMovieSearchPage(request, response) {
    let movies = database.getMovieSearchResults();

    // Send rendered movie search page
    response.status(200)
        .type('html')
        .render("../views/pages/movies", {movies: movies, database: database});
}

//Export the router object so we can access it in the base app
module.exports = router;