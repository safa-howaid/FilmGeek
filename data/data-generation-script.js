const fs = require('fs');
const shortId = require('shortid');
const movies = {};
const people = {};
const reviews = {};
const users = {};

let sampleReviews = [
    {
        "rating" : "4",
        "reviewer": "1",
        "date" : "Mon Mar 7 2021",
        "summary": "The film is about a group of living things who do some things somewhere and the things that they do are apparently interesting enough to warrant a full-feature film.",
        "fullReview" : "I didn't think the movie is all that great. I can probably make a better film than this if only I had a bunch of potatoes and nails."
    },
    {
        "rating" : "9",
        "reviewer": "2",
        "date" : "Sat Feb 27 2021"
    }
]

function generateMovieandReviewData() {
    const movieData = require("./movie-data-10.json");

    // Add movies ids and reviews
    movieData.forEach(movie => {
        const movieId = shortId.generate();
        movie.id = movieId;
        movie.Reviews = [];
        sampleReviews.forEach(review => {
            review.id = shortId.generate();
            review.movie = movieId;
            users[review.reviewer].reviews.push(movieId)
            reviews[review.id] = review;
            movie.Reviews.push(review.id)
        })
        movies[movieId] = movie;
    });
}

function generatePeopleData() {
    Object.values(movies).forEach(movie => {
        movie.Director.forEach(director => {
            const newId = shortId.generate();
            const foundId = findPersonIdByName(director);
            if (foundId == undefined) {
                people[newId] = {"id": newId, "name": director, "actingRoles": [], "writingRoles": [], "directingRoles": [movie.id], "followers":[], "frequentCollaborators": []};
            }
            else {
                people[foundId].directingRoles.push(movie.id);
            }
        });
        movie.Writer.forEach(writer =>{
            const newId = shortId.generate();
            const foundId = findPersonIdByName(writer);
            if (foundId == undefined) {
                people[newId] = {"id": newId, "name": writer, "actingRoles": [], "writingRoles": [movie.id], "directingRoles": [], "followers":[], "frequentCollaborators": []};
            }
            else {
                people[foundId].writingRoles.push(movie.id);
            }
        });
        movie.Actors.forEach(actor => {
            const newId = shortId.generate();
            const foundId = findPersonIdByName(actor);
            if (foundId == undefined) {
                people[newId] = {"id": newId, "name": actor, "actingRoles": [movie.id], "writingRoles": [], "directingRoles": [], "followers":[], "frequentCollaborators": []};
            }
            else {
                people[foundId].actingRoles.push(movie.id);
            }
        });
    })
}

function generateFrequentCollaborators() {
    Object.values(people).forEach(person => {
        if (person.directingRoles.length > 0) {
            let id = person.directingRoles[0];
            const actorList = movies[id].Actors;
            actorList.forEach(actor => {
                const foundId = findPersonIdByName(actor);
                person.frequentCollaborators.push(foundId);
            })
        }
        if (person.writingRoles.length > 0) {
            let id = person.writingRoles[0];
            const actorList = movies[id].Actors;
            actorList.forEach(actor => {
                const foundId = findPersonIdByName(actor);
                person.frequentCollaborators.push(foundId);
            })
        }
        if (person.actingRoles.length > 0) {
            let id = person.actingRoles[0]
            const actorList = movies[id].Actors;
            
            actorList.forEach(actor => {
                if (actor != person.name) {
                    const foundId = findPersonIdByName(actor);
                    person.frequentCollaborators.push(foundId);
                }
            })
        }
    });
}

function generateUserData() {
    users["1"] = {
        "id" : "1",
		"password": "pa55word",
		"watchlist": [],
		"recommendedMovies": [],
		"isContributer": true,
		"usersFollowed" : ["2"],
		"personsFollowed" : [],
		"followers" : ["2"],
		"reviews": [],
		"notifications": []
    }
    users["2"] = {
        "id" : "2",
		"password": "pa55word",
		"watchlist": [],
		"recommendedMovies": [],
		"isContributer": true,
		"usersFollowed" : ["1"],
		"personsFollowed" : [],
		"followers" : ["1"],
		"reviews": [],
		"notifications": []
    }
}

function generateMovieRating() {
    Object.values(movies).forEach(movie => {
        let rating = 0;
        movie.Reviews.forEach(review => {
            rating += Number(reviews[review].rating);
        })
        rating = Math.round(rating / (movie.Reviews.length));
        movie.Rating = String(rating);
    })
}

function findPersonIdByName(name) {
    let person = Object.values(people).filter(person => person.name === name)[0];
    if (person == undefined) {
        return undefined;
    }
    return person.id;
}

generateUserData();
generateMovieandReviewData();
generatePeopleData();
generateFrequentCollaborators();
generateMovieRating();

/*  This script was used to generate some initial sample data for the project check-in.
    The data was then manually manipulated to produce a variety of data
    Please do not write over the files because it may break the application!
*/
// fs.writeFileSync('./data/people.json', JSON.stringify(people, null, 2) , 'utf-8');
// fs.writeFileSync('./data/movies.json', JSON.stringify(movies, null, 2) , 'utf-8');
// fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2) , 'utf-8');
// fs.writeFileSync('./data/reviews.json', JSON.stringify(reviews, null, 2) , 'utf-8');