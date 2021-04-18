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

userSchema.statics.addReview = function(userId, reviewId) {
    this.findById(userId, function(err, result) {
        result.reviews.push(reviewId);
        result.save();
    })
}

// Returns a Promise with value true if userA follows userB
userSchema.statics.isFollowingUser = function(userA, userB) {
    return this.findById(userA).exec().then(result => {
        return result ? result.usersFollowed.includes(userB) : false;
    });
}

// Add userB to userA's usersFollowed list
userSchema.statics.followUser = function(userA, userB, callback) {
    return this.findById(userA).exec(function(err, result) {
        result.usersFollowed.push(userB);
        result.save(callback);
    })
}

// Add userA to userB's followers list
userSchema.statics.addFollower = function(userA, userB, callback) {
    return this.findById(userB).exec(function(err, result) {
        result.followers.push(userA);
        result.save(callback);
    })
}

// Removes userB from userA's usersFollowed list
userSchema.statics.unfollowUser = function(userA, userB, callback) {
    return this.findById(userA).exec(function(err, result) {
        result.usersFollowed = result.usersFollowed.filter(userId => String(userId) != String(userB))
        result.save(callback);
    })
}

// Removes userA from userB's followers list
userSchema.statics.removeFollower = function(userA, userB, callback) {
    return this.findById(userB).exec(function(err, result) {
        result.followers = result.followers.filter(userId => String(userId) != String(userA))
        result.save(callback);
    })
}

// Returns a Promise with value true if user follows person
userSchema.statics.isFollowingPerson = function(userId, personId) {
    return this.findById(userId).exec().then(result => {
        return result ? result.peopleFollowed.includes(personId) : false;
    });
}

// Add person to user's peopleFollowed list
userSchema.statics.followPerson = function(userId, personId, callback) {
    return this.findById(userId).exec(function(err, result) {
        result.peopleFollowed.push(personId);
        result.save(callback);
    })
}

// Removes person from user's peopleFollowed list
userSchema.statics.unfollowPerson = function(userId, personId, callback) {
    return this.findById(userId).exec(function(err, result) {
        result.peopleFollowed = result.peopleFollowed.filter(id => String(personId) != String(id))
        result.save(callback);
    })
}

// Returns a Promise with value true if user has movie in watchlist
userSchema.statics.watchedMovie = function(user, movie) {
    return this.findById(user).exec().then(result => {
        return result ? result.watchlist.includes(movie) : false;
    });
}

// Adds movie to user's watchlist
userSchema.methods.addToWatchlist = function(movie, callback) {
    this.watchlist.push(movie);
    this.save(callback);
}

// Removes movie from user's watchlist
userSchema.methods.removeFromWatchlist = function(movie, callback) {
    this.watchlist = this.watchlist.filter(id => String(movie) != String(id._id))
    this.save(callback);
}

// Sends a notification to all followers that this user has written a new review
userSchema.methods.sendNotifications = function(reviewId) {
    this.followers.forEach(async(follower) => {
        const user = await User.findById(follower)
        const notification = new Notification({
            user: this._id,
            details: " has written a new review.",
            review: reviewId
        })
        user.notifications.push(notification._id)
        await notification.save()
        await user.save()
    })
}

// Recommend the 5 highest rated movies to the user
// NOTE: only for users with no movies in their watchlist
userSchema.methods.recommendTopRatedMovies = async function() {
    let movies = await Movie.getTopMovies()

    movies.forEach(movie => {
        this.recommendedMovies.push(movie._id)
    })

    this.save(function(err, result) {
        if (err) {
            console.log("Error saving movie recommendation.")
        }
    })
}

// Add a movie recommendation for the user based on the most frequent genre in their watchlist
userSchema.methods.recommendMovies = async function() {
    let genre = getGenreForRecommendation(this)

    let movies = []
    await Movie.findByQuery(1, 5, "?", genre, "?").then(result => {
        result.forEach(movie => {
            movies.push(movie._id)
        })
    })
    this.recommendedMovies = movies

    this.save(function(err, result) {
        if (err) {
            console.log("Error saving movie recommendation.")
        }
    })
}

// Returns the most frequent genre in the given user's watchlist
// If tied, just returns the first genre after sorting by frequencies
function getGenreForRecommendation(user) {
    let genreFrequencies = []

    user.watchlist.forEach(movie => {
        movie.genre.forEach(genre => {
            let specificGenre = genreFrequencies.filter(obj => obj['genre'] == genre)[0]
            if (!specificGenre) {
                genreFrequencies.push({genre: genre, frequency: 1})    
            }
            else {
                specificGenre.frequency++;
            }
        })
    })
    genreFrequencies.sort((a, b) => b.frequency - a.frequency)

    if (genreFrequencies[0]) {
        return genreFrequencies[0].genre
    }
    return "?"
}

const User = mongoose.model("User", userSchema);
module.exports = User;

const Notification = require("./notificationModel");
const Movie = require("./movieModel");