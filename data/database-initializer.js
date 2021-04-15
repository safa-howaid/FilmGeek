const fs = require('fs');
const mongoose = require("mongoose");

const movieData = require("./movieData/movie-data-10.json");
const Movie = require("./models/movieModel");
const Person = require("./models/personModel");
const User = require("./models/userModel");
const Review = require("./models/reviewModel");
const databaseName = "FilmGeekDB"

const allMovies = [];
const allPeople = {};
const allUsers = [];
const allReviews = [];


// Format the provided movie data into movie objects based on the defined Mongoose Schema
function createMovieObjects() {
    movieData.forEach(movie => {
        let movieObject = new Movie ({
            "title": movie.Title,
            "ageRating": movie.Rated,
            "releaseDate": movie.Released,
            "runtime": movie.Runtime,
            "genre": movie.Genre,
            "plot": movie.Plot,
            "poster": movie.Poster
        })

        let actors = createPeopleObjects(movie.Actors, movieObject._id, "actingRoles");
        movieObject.actors = actors;

        let writers = createPeopleObjects(movie.Writer, movieObject._id, "writingRoles");
        movieObject.writers = writers;

        let directors = createPeopleObjects(movie.Director, movieObject._id, "directingRoles");
        movieObject.directors = directors;
        
        allMovies.push(movieObject)
    })
    createUserObjects();
}

// Take an array of people names and return an array of person id references
function createPeopleObjects(people, movieId, role) {
    let peopleObjects = []

    people.forEach(person => {
        let personObject;

        // Check if person exists. If not, then create them
        if (!allPeople.hasOwnProperty(person) && person != "N/A") {
            personObject = new Person({
                name: person
            })
        }
        else {
            personObject = allPeople[person]
        }

        if (personObject) {
            personObject[role].push(movieId)
            peopleObjects.push(personObject._id)
            allPeople[person] = personObject
        }
    })
    return peopleObjects
}

// Creates two sample users that have reviewed all movies
function createUserObjects() {
    let recommendation1 = [allMovies[0]._id, allMovies[1]._id, allMovies[2]._id]
    let recommendation2 = [allMovies[3]._id, allMovies[4]._id, allMovies[5]._id]
    let watchlist1 = [allMovies[6]._id, allMovies[7]._id, allMovies[8]._id]
    let watchlist2 = [allMovies[9]._id, allMovies[0]._id, allMovies[1]._id]
    let personsFollowed1 = Object.values(allPeople).slice(0, 3)
    let personsFollowed2 = Object.values(allPeople).slice(4, 7)

    let user1 = new User({
        "username": "user1",
        "password": "password",
        "isContributer": true,
        "watchlist": watchlist1,
        "recommendation": recommendation1,
        "personsFollowed": personsFollowed1
    })
    
    let user2 = new User({
        "username": "user2",
        "password": "password",
        "isContributer": false,
        "usersFollowed": [user1._id],
        "followers" : [user1._id],
        "watchlist": watchlist2,
        "recommendation": recommendation2,
        "personsFollowed": personsFollowed2
    })

    user1.usersFollowed.push(user2._id)
    user1.followers.push(user2._id)

    allMovies.forEach(movie => {
        let review1 = new Review ({
            "rating" : getRandomInt(1, 10),
            "reviewer": user1._id,
            "movie": movie._id,
            "summary": "The film is about a group of living things who do some things somewhere and the things that they do are interesting enough to put in a movie.",
            "fullReview" : "The movie is not too bad. I enjoyed it sometimes."
        })
        let review2 = new Review ({
            "rating" : getRandomInt(1, 10),
            "reviewer": user2._id,
            "movie": movie._id
        })

        user1.reviews.push(review1._id)
        user2.reviews.push(review2._id)
        movie.reviews.push(review1._id)
        movie.reviews.push(review2._id)
        allReviews.push(review1);
        allReviews.push(review2);
        
        movie.rating =  Math.round((review1.rating + review2.rating) / 2)
    })

    allUsers.push(user1);
    allUsers.push(user2);

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

// Find collaborators for all people
function findCollaborators() {
    return new Promise(function(resolve, reject) {
        Movie.find().populate("directors actors writers").exec(function (err, movies) {
            if(err) {
                reject(err)
            } 
    
            movies.forEach(async (movie) => {
                movie.findCollaborators()
                .then((result) => {resolve(result)})
                .catch((error) =>{reject(error)})
            })
        })
    })
}

// Recommend movies for all users
function recommendMovies() {
    return new Promise((resolve, reject) => {
        User.find().populate("watchlist").exec(function(err, users) {
            if(err){
                reject(err);
            }

            let count = 0;
            users.forEach(user => {
                user.recommendMovies()
                count++;
            })

            if(count == users.length){
                resolve()
            }
        })
    })
}

createMovieObjects()

mongoose.connect(`mongodb://localhost/${databaseName}`, {useNewUrlParser: true,  useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});
const database = mongoose.connection;
database.on('error', console.error.bind(console, 'connection error:'));

database.once('open', function() {
	database.dropDatabase(async function(err, result){
		if(err){
			console.log("Error dropping database:");
			console.log(err);
			return;
		}
		console.log("Dropped database. Starting re-creation.");
		
        //Add all of the movie documents to the database
        await Movie.insertMany(allMovies)
        .catch(err => {
            if(err){
                console.log(err);
                return;
            }
        })
        .then(result => {
            console.log("All " + result.length + " movies were added.")
        })
            
            
        //Add all of the people documents to the database
        await Person.insertMany(Object.values(allPeople))
        .catch(err => {
            if(err){
                console.log(err);
                return;
            }
        })
        .then(result => {
            console.log("All " + result.length + " people were added.")
        })

        //Add all of the user documents to the database
        await User.insertMany(allUsers)
        .catch(err => {
            if(err){
                console.log(err);
                return;
            }
        })
        .then(result => {
            console.log("All " + result.length + " users were added.")
        })

        //Add all of the review documents to the database
        await Review.insertMany(allReviews)
        .catch(err => {
            if(err){
                console.log(err);
                return;
            }
        })
        .then(result => {
            console.log("All " + result.length + " reviews were added.")
        })

        // Add movie recommendation for generated users
        await recommendMovies()
        .catch(err => {
            if(err){
                console.log(err);
                return;
            }
        })
        .then(result => {
            console.log("Movie recommendations for users were added.")
        })

        // Message to show that the script is still running
        setInterval(function() {console.log("Database initialization still in progress....")}, 500)
        // Run algorithm to find all collaborations
        await findCollaborators()
        .catch((error) => {console.log(error);})
        .then((result) => {
            console.log("All collaborations were found")
        })

        // Find frequent collaborators for all people
        await Person.findAllFrequentCollaborators()
        .then((result) => {
            console.log("Frequent collaborators were added for each person.")
            console.log('All done!');
            mongoose.connection.close()
            process.exit()
        })
    });
});