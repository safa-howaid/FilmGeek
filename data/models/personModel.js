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
    collaborators: [{
        person: {
            type: Schema.Types.ObjectId,
            ref: "Person",
        },
        frequency: {
            type: Number,
            default: 1,
        }
    }],
    frequentCollaborators: [{
        type: Schema.Types.ObjectId,
        ref: "Person",
    }]
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

// Fins frequent collaborators for a single person
personSchema.methods.findFrequentCollaborators = function() {
    this.collaborators.sort(function(a, b) {return b.frequency - a.frequency})

    this.collaborators.slice(0, 5).forEach(collaborator => {
        person.frequentCollaborators.push(collaborator.person)
    })

    this.save()
    .then((result) => {
        console.log("Frequent collaborators saved.")
    })
    .catch((err) => {
        console.log("Error saving frequent collaborators.")
    })
}

// Finds frequent collaborators for all people
personSchema.statics.findAllFrequentCollaborators = async function() {
    let allPeople = await this.find()

    await Promise.all(allPeople.map(async (person) => {
        person.collaborators.sort(function(a, b) {return b.frequency - a.frequency})
        
        person.collaborators.slice(0, 5).forEach(collaborator => {
            person.frequentCollaborators.push(collaborator.person)
        })
        await person.save()
      }));
}

// Sends a notification to all followers that this person has worked in a new movie
personSchema.methods.sendNotifications = function(movieId) {
    console.log(movieId)
    this.followers.forEach(async(follower) => {
        console.log(follower)
        const user = await User.findById(follower).exec();
        const notification = new Notification({
            person: this._id,
            details: " has worked on a new movie.",
            movie: movieId
        })
        console.log(notification)
        user.notifications.push(notification._id)
        await notification.save()
        await user.save()
    })
}

const Person = mongoose.model("Person", personSchema);
module.exports = Person

const User = require("./userModel");
const Notification = require("./notificationModel");