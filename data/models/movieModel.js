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
        type: Number
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

module.exports = mongoose.model("Movie", movieSchema);