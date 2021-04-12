const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    person: {
        type: Schema.Types.ObjectId,
        ref: "Person"
    },
    review: {
        type: Schema.Types.ObjectId,
        ref: "Review"
    },
    movie: {
        type: Schema.Types.ObjectId,
        ref: "Movie"
    },
    details: {
        type: String,
        required: true
    },
    date: { 
        type: Date,
        default: Date.now
    },
    read: { 
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Notification", notificationSchema);