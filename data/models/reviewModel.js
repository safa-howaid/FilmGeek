const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
    rating: {
        type: Number,
        required: [true, "Rating is a required field for Reviews."]
    },
    reviewer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Reviewer is a required field for Reviews."]
    },
    movie: {
        type: Schema.Types.ObjectId,
        ref: "Movie",
        required: [true, "Movie is a required field for Reviews."]
    },
    summary: {
        type: String
    },
    fullReview: {
        type: String
    },
    date: { 
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Review", reviewSchema);