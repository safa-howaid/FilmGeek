const express = require('express');
const Review = require("../data/models/reviewModel")
const Movie = require("../data/models/movieModel")
const User = require("../data/models/userModel")

//Create the router
let router = express.Router();

router.post("/", createReview)

// Creates a review and updates other documents as required
function createReview(request, response) {
    const newReview = new Review({
        "rating": request.body.rating,
        "reviewer": request.body.reviewer,
        "movie": request.body.movie,
        "summary": request.body.summary,
        "fullReview": request.body.fullReview
    })

    newReview.save(function(err, result) {
        if (err) {
            response.status(400).send("Error adding new review.")
        }
        response.status(201).send();
    })

    Movie.addReview(request.body.movie, newReview._id)
    Movie.calculateMovieRating(request.body.movie)
    User.addReview(request.body.reviewer, newReview._id)

    User.findById(request.body.reviewer, function (err, result) {
        result.sendNotifications(newReview._id)
    })
}

//Export the router object so we can access it in the base app
module.exports = router;