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
userSchema.statics.isFollowing = function(userA, userB) {
    return this.findById(userA).exec().then(result => {
        return result.usersFollowed.includes(userB);
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
        console.log(result.usersFollowed)
        result.save(callback);
    })
}

// Removes userA from userB's followers list
userSchema.statics.removeFollower = function(userA, userB, callback) {
    return this.findById(userB).exec(function(err, result) {
        result.followers = result.followers.filter(userId => String(userId) != String(userA))
        console.log(result.followers)
        result.save(callback);
    })
}

module.exports = mongoose.model("User", userSchema);