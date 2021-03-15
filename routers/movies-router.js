const express = require('express');
const path = require('path');
const database = require('../data/database');

//Create the router
let router = express.Router();

router.get('/', displayMovieSearchPage)

router.get('/:id', displayMovie)

function displayMovie(request, response) {
    let id = request.params.id;
    let movie = database.getMovieById(id);

    // If movie is not found, send error
    if (movie == undefined) {
        response.status(404)
            .send("Page not found")
        return
    }

    // Send rendered movie page
    response.status(200)
        .type('html')
        .render("../views/pages/movie", {movie: movie, database: database});
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