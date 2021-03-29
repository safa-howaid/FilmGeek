const mongoose = require("mongoose");
const { Schema } = mongoose;

let userSchema = new Schema({
	username: {
		type: String, 
		required: [true, "Username is a required field."],
        unique: [true, "Username must be unique."]
	},
    password: {
        type: String,
        required: [true, "Password is a required field."],
    },
    isContributer: {
        type: Boolean,
        default: false
    },
    watchlist: [{
        type: Schema.Types.ObjectId,
        ref: "Movie",
    }],
    usersFollowed: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    peopleFollowed: [{
        type: Schema.Types.ObjectId,
        ref: "Person",
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    recommendedMovies: [{
        type: Schema.Types.ObjectId,
        ref: "Movie",
    }],
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review",
    }],
    notifications: [{
        type: Schema.Types.ObjectId,
        ref: "Notification",
    }],
});

module.exports = mongoose.model("User", userSchema);