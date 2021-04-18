const express = require('express');
const User = require("../data/models/userModel")
const Review = require("../data/models/reviewModel")
const Movie = require("../data/models/movieModel")
const ObjectId= require('mongoose').Types.ObjectId
const jsStringify = require('js-stringify');

//Create the router
let router = express.Router();

router.get('/', (request, response) => {response.send("Users Search")})
// Retrieve a user page/json
router.get('/:id', sendUser)
// Create a new account
router.post('/', [validateUserInput, createNewUser])
// Change user status (Regular/Contributer)
router.put('/:id', changeUserContributionStatus)
// Follow user
router.delete('/:id/usersFollowed', unfollowUser)
// Unfollow user
router.post('/:id/usersFollowed', followUser)
// Add movie to user watchlist
router.delete('/:id/watchlist', removeFromWatchlist)
// Remove movie from user watchlist
router.put('/:id/watchlist', addToWatchlist)

// Load user from database when given movie id
router.param("id", function(request, response, next, id) {
    let oid;

	try{
		oid = new ObjectId(id);
	}catch(err){
		console.log(err);
		response.status(404).send("That user does not exist.");
		return;
	}

    User.findById(oid, { "reviews": { $slice: -10 } })
    .populate({ 
        path: 'watchlist',
        populate: {
          path: 'actors',
          model: 'Person',
          select: "name"
        }
    })
    .populate("usersFollowed", "username")
    .populate("peopleFollowed", "name")
    .populate("followers", "username")
    .populate({ 
        path: 'reviews',
        populate: {
          path: 'movie',
          model: 'Movie',
          select: "title"
        }
    })
	.exec(function(err, result){
		if(err){
			console.log(err);
			response.status(500).send("Error reading user data.");
			return;
		}
		
		if(!result){
			response.status(404).send("That user does not exist.");
			return;
		}
		response.user = result;
		next();
	});
})

function changeUserContributionStatus(request, response) {
    let isContributer = request.body.isContributer == "true"
    response.user.isContributer = isContributer
    response.user.save(function(err, result) {
        if (err) {
            return response.status(500).send("Error saving new user state.")
        }
        request.session.isContributer = isContributer
        response.status(200).send()
    });
}

// Send a single user page/object
function sendUser(request, response) {
    if (response.user.username == request.session.username) {
        response.redirect("/profile")
        return
    }

    // Check if user follows current user and send rendered user page or user json data
    User.isFollowingUser(request.session.userId, request.params.id).then(isFollowing => {
        response.format({
            "text/html": () => {response.status(200).render("../views/pages/user", {user: response.user, loggedIn: request.session.loggedIn, isFollowing: isFollowing, currentUser: request.session.userId, jsStringify: jsStringify, isContributer: request.session.isContributer})},
            "application/json": () => {response.status(200).json(response.user)}
        });
    })
}

function validateUserInput(request, response, next) {
    const username = request.body.username;
    const password = request.body.password;
    const confirmPassword = request.body.confirmPassword;

    // Checks if passwords match
    if (password != confirmPassword) {
        request.session.errorMessage = "The passwords you entered do not match."
        return response.redirect("/register")
    } 

    // Checks if username exists
    User.exists({ username: username }, function(err, result) {
        if (err) {
          response.send(err);
        } else if (result) {
            request.session.errorMessage = "The username you entered is already taken."
            return response.redirect("/register")
        }
        next()
    });
}

function createNewUser(request, response, next) {
    const username = request.body.username;
    const password = request.body.password;

    let newUser = new User ({
        "username": username,
        "password": password,
    })

    // Saves new user and returns response
    newUser.save(function (err, result) {
        if (err) return console.error(err);
        request.session.loggedIn = true;
        request.session.username = username;
        request.session.userId = result._id;
        request.session.isContributer = false;
        newUser.recommendTopRatedMovies()
        return response.format({
            "text/html": () => response.redirect("/profile"),
            "application/json": () => {response.status(201).json(result)}
        });
    });
}

// UserA unfollows UserB:
// UserB should be removed from UserA's usersFollowed list
// UserA should be removed from UserB's followers list
function unfollowUser(request, response) {
    User.removeFollower(response.user._id, request.body.userId, function(err, result) {
        if (err) {
            console.log("Error removing follower.")
            return response.status(500).send();
        }
        User.unfollowUser(response.user._id, request.body.userId, function(err, result) {
            if (err) {
                console.log("Error unfollowing user.")
                return response.status(500).send();
            }
            return response.status(200).send();
        })
    })
}

// UserA follows UserB:
// UserB should be added to UserA's usersFollowed list
// UserA should be added to UserB's followers list
function followUser(request, response) {
    User.addFollower(response.user._id, request.body.userId, function(err, result) {
        if (err) {
            console.log("Error adding follower.")
            return response.status(500).send();
        }
        User.followUser(response.user._id, request.body.userId, function(err, result) {
            if (err) {
                console.log("Error following user.")
                return response.status(500).send();
            }
            return response.status(200).send();
        })
    })
}

function addToWatchlist(request, response) {
    response.user.addToWatchlist(request.body.movieId, function(err, result) {
        if (err) {
            console.log("Error adding movie to watchlist.")
            return response.status(500).send();
        }
        // Adjust movie recommendation
        response.user.recommendMovies()
        return response.status(200).send();
    })
}

function removeFromWatchlist(request, response) {
    response.user.removeFromWatchlist(request.body.movieId, function(err, result) {
        if (err) {
            console.log("Error removing movie to watchlist.")
            return response.status(500).send();
        }
        // Adjust movie recommendation
        response.user.recommendMovies()
        return response.status(200).send();
    })
}
//Export the router object so we can access it in the base app
module.exports = router;