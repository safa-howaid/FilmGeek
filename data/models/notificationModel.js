const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    personId: {
        type: Schema.Types.ObjectId,
        ref: "Person"
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