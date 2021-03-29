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

module.exports = mongoose.model("Person", personSchema);