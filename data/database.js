let database = {}

function initDatabase() {
    let movies = require("./movies.json");
    database["movies"] = movies;

    let people = require("./people.json");
    database["people"] = people;

    let reviews = require("./reviews.json");
    database["reviews"] = reviews;

    let users = require("./users.json");
    database["users"] = users;
}

function getMovieById(movieId) {
    return database["movies"][movieId];
}

function getPersonById(personId) {
    return database["people"][personId];
}

function getPersonByName(name) {
    return Object.values(database["people"]).filter(person => person.name === name)[0];
}

function getUserById(userId) {
    return database["users"][userId];
}

function getReviewById(reviewId) {
    return database["reviews"][reviewId];
}

function getMovieSearchResults() {
    return Object.values(database["movies"]).slice(0, 10);
}

function getPopularMovies() {
    return Object.values(database["movies"]).slice(0, 5);
}

// Export database functions to be used across the server
module.exports = {
    initDatabase: initDatabase,
    getMovieById: getMovieById,
    getPersonById: getPersonById,
    getPersonByName: getPersonByName,
    getUserById: getUserById,
    getReviewById: getReviewById,
    getMovieSearchResults: getMovieSearchResults,
    getPopularMovies: getPopularMovies
}
