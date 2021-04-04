const express = require('express');
const User = require("../data/models/userModel")
const ObjectId= require('mongoose').Types.ObjectId

//Create the router
let router = express.Router();

router.get('/', (request, response) => {response.send("Users Search")})
router.get('/:id', sendUser)
router.post('/', [validateUserInput, createNewUser])
router.put('/:id', changeUserContributionStatus)

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
    response.user.isContributer = request.body.isContributer
    response.user.save(function(err, result) {
        if (err) {
            return response.status(400).send("Error saving new user state.")
        }
        response.status(200).send()
    });
}

// Send a single user page/object
function sendUser(request, response) {
    if (response.user.username == request.session.username) {
        response.redirect("/profile")
        return
    }
    // Send rendered user page or user json data
    response.format({
		"text/html": () => {response.render("../views/pages/user", {user: response.user, loggedIn: request.session.loggedIn})},
		"application/json": () => {response.status(200).json(response.user)}
	});
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
        return response.format({
            "text/html": () => response.redirect("/profile"),
            "application/json": () => {response.status(201).json(result)}
        });
    });
}

//Export the router object so we can access it in the base app
module.exports = router;