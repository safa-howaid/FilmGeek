const express = require('express');
const User = require("../data/models/userModel")
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

// Load user from database when given movie id
router.param("id", function(request, response, next, id) {
    let oid;
    console.log("Finding user by ID: " + id);

	try{
		oid = new ObjectId(id);
	}catch(err){
		console.log(err);
		response.status(404).send("That user does not exist.");
		return;
	}

    User.findById(oid)
    .populate("watchlist", "title")
    .populate("usersFollowed", "username")
    .populate("peopleFollowed", "name")
    .populate("followers", "username")
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
		console.log("Result:");
		console.log(result);
		response.user = result;
		next();
	});
})

function changeUserContributionStatus(request, response) {
    let isContributer = request.body.isContributer == "true"
    response.user.isContributer = isContributer
    response.user.save(function(err, result) {
        if (err) {
            return response.status(400).send("Error saving new user state.")
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
            "text/html": () => {response.render("../views/pages/user", {user: response.user, loggedIn: request.session.loggedIn, isFollowing: isFollowing, currentUser: request.session.userId, jsStringify: jsStringify, isContributer: request.session.isContributer})},
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
    console.log(newUser)

    // Saves new user and returns response
    newUser.save(function (err, result) {
        if (err) return console.error(err);
        request.session.loggedIn = true;
        request.session.username = username;
        request.session.userId = result._id;
        request.session.isContributer = false;
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
            response.status(400).send();
        }
        User.unfollowUser(response.user._id, request.body.userId, function(err, result) {
            if (err) {
                console.log("Error unfollowing user.")
                response.status(400).send();
            }
            response.status(200).send();
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
            response.status(400).send();
        }
        User.followUser(response.user._id, request.body.userId, function(err, result) {
            if (err) {
                console.log("Error following user.")
                response.status(400).send();
            }
            response.status(200).send();
        })
    })
}

//Export the router object so we can access it in the base app
module.exports = router;