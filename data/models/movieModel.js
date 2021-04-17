const mongoose = require("mongoose");
const { Schema } = mongoose;

let movieSchema = new Schema({
	title: {
		type: String, 
		required: [true, "Movie title is a required field"],
	},
    ageRating: {
        type: String,
        default: "Not Rated"
    },
    releaseDate: {
        type: String
    },
    runtime: {
        type: String
    },
    rating: {
        type: Number,
        default: 1
    },
    genre: [{
        type: String
    }],
    directors: [{
        type: Schema.Types.ObjectId,
        ref: "Person",
    }],
	writers: [{
        type: Schema.Types.ObjectId,
        ref: "Person",
    }],
    actors: [{
        type: Schema.Types.ObjectId,
        ref: "Person",
    }],
    plot: {
        type: String
    },
    poster: {
        type: String
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    similarMovies: [{
        type: Schema.Types.ObjectId,
        ref: "Movie"
    }]
});

movieSchema.statics.getTopMovies = function() {
    const filter = {};
    const fields = null;
    const options = {
        limit: 5,
        sort: {
            rating: -1
        }
    }
    return this.find(filter, fields, options)
}

movieSchema.statics.findByQuery = function(page, limit, title, genre, actor) {
    let startIndex = ((page - 1) * limit);
    
    return this.aggregate([
        {$lookup: { from: "people", localField: "actors", foreignField: "_id", as: "actors"}},
        {$match: {
            "actors.name" : {$regex: new RegExp(".*" + actor + ".*") , $options: "i"},
            "title" : {$regex: new RegExp(".*" + title + ".*") , $options: "i"},
            "genre" : {$regex: new RegExp(".*" + genre + ".*") , $options: "i"}
        }},
        {$sort: {rating: -1}},
        {$skip: startIndex},
        {$limit: limit}
    ])
}

movieSchema.statics.addReview = function(movieId, reviewId) {
    this.findById(movieId, function(err, result) {
        result.reviews.push(reviewId)
        result.save()
    })
}

movieSchema.statics.calculateMovieRating = function(movieId) {
    this.findById(movieId).populate("reviews").exec(function(err, result) {
        let averageRating = Math.round(result.reviews.reduce((a, b) => a + b.rating, 0) / result.reviews.length);
        result.rating = averageRating;
        result.save();
    })
}

movieSchema.methods.findCollaborators = async function() {
    const allPeople = getAllPeopleFromMovie(this)

    await Promise.all(allPeople.map(async (person) => {
        allPeople.forEach(otherPerson => {
            if (String(person._id) != String(otherPerson._id)) {
                let collaborator = person.collaborators.find(collaborator => String(collaborator["person"]) == String(otherPerson._id));

                if(collaborator) {
                    collaborator.frequency += 1
                }
                else {
                    person.collaborators.push({person: otherPerson._id, frequency: 1})
                }
            }
        })
        await person.save().catch(err => {
            
        })
    }));
}

function getAllPeopleFromMovie(movie) {
    let allPeople = []
    let addedPeople = new Set()
    
    movie.actors.forEach(person => {
        let id = String(person._id)
        if (!addedPeople.has(id)) {
            allPeople.push(person)
            addedPeople.add(id)
        }
    })
    movie.writers.forEach(person => {
        let id = String(person._id)
        if (!addedPeople.has(id)) {
            allPeople.push(person)
            addedPeople.add(id)
        }
    })
    movie.directors.forEach(person => {
        let id = String(person._id)
        if (!addedPeople.has(id)) {
            allPeople.push(person)
            addedPeople.add(id)
        }
    })
    return allPeople;
}

// Find the highest-rated movies that contain all the genres as this movie.
// If there are less than 5, find the highest-rated movies that contain at least one of the genres in this movie.
movieSchema.methods.findSimilarMovies = async function() {
    const filter = {_id: {$ne: this._id}, genre: {$all : this.genre}};
    const fields = null;
    const options = {
        limit: 5,
        sort: {
            rating: -1
        }
    };
    let similarMovies = await Movie.find(filter, fields, options)

    if(similarMovies.length != 5) {
        const filter = {_id: {$ne: this._id}, genre: {$in : this.genre}};
        const fields = null;
        const options = {
            limit: 5,
            sort: {
                rating: -1
            }
        };
        similarMovies = await Movie.find(filter, fields, options);
    }

    this.similarMovies = similarMovies;
    await this.save().catch(err => {
        if (err) {
            console.log("Error saving similar movies.");
        }     
    })
}

// Sends a notification to all followers of the people in this movie about a new movie
movieSchema.methods.sendNotifications = function() {
    const allPeople = getAllPeopleFromMovie(this)
    let movieId = this._id
    allPeople.forEach(async(person) => {
        let personObject = await Person.findById(person._id);
        console.log(personObject)
        personObject.sendNotifications(movieId)
    })
    console.log(allPeople)
}

movieSchema.methods.sendMovieReference = function() {
    let movieId = this._id;
    this.actors.forEach(personId => {
        Person.addActingRole(personId, movieId)
    })
    this.writers.forEach(personId => {
        Person.addWritingRole(personId, movieId)
    })
    this.directors.forEach(personId => {
        Person.addDirectingRole(personId, movieId)
    })
}

const Movie = mongoose.model("Movie", movieSchema);
module.exports = Movie;

const Person = require("./personModel");