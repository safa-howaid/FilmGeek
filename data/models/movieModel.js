const mongoose = require("mongoose");
const { Schema } = mongoose;

let movieSchema = new Schema({
	title: {
		type: String, 
		required: [true, "Movie title is a required field"],
        unique: true
	},
    ageRating: {
        type: String
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

module.exports = mongoose.model("Movie", movieSchema);