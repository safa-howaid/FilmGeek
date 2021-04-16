const express = require('express');
const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const Movie = require("../data/models/movieModel")
const Person = require("../data/models/personModel")
const Review = require("../data/models/reviewModel")
const User = require("../data/models/userModel")
const jsStringify = require('js-stringify');

// Create the router
let router = express.Router();

router.get('/', [queryParser, loadMovies, displayMovieSearchPage])
router.get('/:id', sendMovie)
router.post('/', addMovie)

// Load movie from database when given movie id
router.param("id", function(request, response, next, id) {
    let oid;
    console.log("Finding movie by ID: " + id);

	try{
		oid = new ObjectId(id);
	}catch(err){
		console.log(err);
		response.status(404).send("That movie does not exist.");
		return;
	}

    Movie.findById(oid)
    .populate("actors", "name")
    .populate("directors", "name")
    .populate("writers", "name")
    .populate({ 
        path: 'reviews',
        populate: {
          path: 'reviewer',
          model: 'User',
          select: "username"
        }
    })
    .populate("similarMovies", "poster title")
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
    User.watchedMovie(request.session.userId, response.movie._id).then(watched => {
        response.format({
            "text/html": () => {response.render("../views/pages/movie", {movie: response.movie, loggedIn: request.session.loggedIn, jsStringify: jsStringify, userId: request.session.userId, isContributer: request.session.isContributer, watched: watched})},
            "application/json": () => {response.status(200).json(response.movie)}
        });
    })
}

//Parse the query parameters
//page: the page of results to send back
//title: string to find in movie title to be considered a match
//actor: string to find in actors array to be considered a match
//genre: string to find in movie genre to be considered a match
function queryParser(request, response, next){
	//Build a query string to use for pagination 
	let parameters = [];
	for(query in request.query){
		if(query == "page"){
			continue;
		}
		parameters.push(query + "=" + request.query[query]);
	}
	request.qstring = parameters.join("&");
	
	//Parse page parameter
	try{
		if(!request.query.page){
			request.query.page = 1;
		}
		
		request.query.page = Number(request.query.page);
		
		if(request.query.page < 1){
			request.query.page = 1;
		}
	}catch{
		request.query.page = 1;
	}
	
    //Parse title
	if(!request.query.title){
		request.query.title = "?";
	}

    //Parse genre
    if(!request.query.genre){
		request.query.genre = "?";
	}

    //Parse actor
    if(!request.query.actor){
		request.query.actor = "?";
	}

	next();
}

//Find matching products by querying Movie model
function loadMovies(request, response, next){
	Movie.findByQuery(request.query.page, 10, request.query.title, request.query.genre, request.query.actor)
    .then(results => {
		console.log("Found " + results.length + " matching movies.");
		response.movies = results;
        results.forEach(result =>{
            console.log(result)
            result.actors.forEach(actor => {
                console.log(actor)
            })
            
        })
		next();
		return;
	})
    .catch(err => {
        response.status(500).send("Error reading movies.");
        console.log(err);
        return;
    })
}

async function displayMovieSearchPage(request, response) {
    const genres = await Movie.find().distinct("genre");
    response.format({
        "text/html": () => {response.render("../views/pages/movies", {movies: response.movies, queryString: request.qstring, currentPage: request.query.page, genres: genres, isContributer: request.session.isContributer, loggedIn: request.session.loggedIn})},
        "application/json": () => {response.status(200).json(response.movies)}
    });
}

function addMovie(request, response) {
    let newMovie = new Movie(request.body)
    newMovie.save(function (err, result) {
        if (err) {
            response.status(500).send("Error saving movie.");
            console.log(err);
            return;
        }
        response.status(201).send(String(newMovie._id))
    })
}

//Export the router object so we can access it in the base app
module.exports = router;