const mongoose = require("mongoose");
const { Schema } = mongoose;

let personSchema = new Schema({
	name: {
		type: String, 
		required: [true, "Name is a required field for People"],
        unique: true
	},
    actingRoles: [{
        type: Schema.Types.ObjectId,
        ref: "Movie",
    }],
    writingRoles: [{
        type: Schema.Types.ObjectId,
        ref: "Movie",
    }],
    directingRoles: [{
        type: Schema.Types.ObjectId,
        ref: "Movie",
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    frequentCollaborators: [{
        type: Schema.Types.ObjectId,
        ref: "Person",
    }],
});

// Add user to person's follower list
personSchema.statics.addFollower = function(personId, userId, callback) {
    return this.findById(personId).exec(function(err, result) {
        result.followers.push(userId);
        result.save(callback);
    })
}

// Removes user from person's follower list
personSchema.statics.removeFollower = function(personId, userId, callback) {
    return this.findById(personId).exec(function(err, result) {
        result.followers = result.followers.filter(id => String(userId) != String(id))
        result.save(callback);
    })
}

module.exports = mongoose.model("Person", personSchema);