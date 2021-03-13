let database = {}

function initDatabase() {
    let movies = require("./movies.json");
    database["movies"] = movies;

    let people = require("./people.json");
    database["people"] = people;

}

function getMovieById(movieId) {
    return database["movies"][movieId]
}

function getPersonById(personId) {
    return database["people"][personId]
}

function getPersonByName(name) {
    return Object.values(database["people"]).filter(person => person.name === name)[0];
}

function getUserById(userId) {
    return database["user"][userId]
}

// Export database functions to be used across the server
module.exports = {
    initDatabase: initDatabase,
    getMovieById: getMovieById,
    getPersonById: getPersonById,
    getPersonByName: getPersonByName,
    getUserById: getUserById
}
