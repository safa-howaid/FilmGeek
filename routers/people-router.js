const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const Person = require("../data/models/personModel")
const Movie = require("../data/models/movieModel");
const session = require('express-session');
const jsStringify = require('js-stringify');
const User = require("../data/models/userModel")

//Create the router
let router = express.Router();

router.get('/', (request, response) => {response.send("People Search")})
// Retrieve a person page/json
router.get('/:id', sendPerson)
// Add follower
router.post('/:id/followers', addFollower)
// Remove follower
router.delete('/:id/followers', removeFollower)

// Load person from database when given person id
router.param("id", function(request, response, next, id) {
    let oid;
    console.log("Finding person by ID: " + id);

	try{
		oid = new ObjectId(id);
	}catch(err){
		console.log(err);
		res.status(404).send("That person does not exist.");
		return;
	}

    Person.findById(oid)
    .populate("actingRoles", "title")
    .populate("writingRoles", "title")
    .populate("directingRoles", "title")
    .populate("frequentCollaborators", "name")
	.exec(function(err, result){
		if(err){
			console.log(err);
			response.status(500).send("Error reading person data.");
			return;
		}
		
		if(!result){
			response.status(404).send("That person does not exist.");
			return;
		}
		console.log("Result:");
		console.log(result);
		response.person = result;
		next();
	});
})

// Send a single person page/object
function sendPerson(request, response) {
    // Check if user follows person and send rendered person page or person json data
    User.isFollowingPerson(request.session.userId, request.params.id).then(isFollowing => {
        response.format({
            "text/html": () => {response.render("../views/pages/person", {person: response.person, loggedIn: request.session.loggedIn, isFollowing: isFollowing, userId: request.session.userId, jsStringify: jsStringify})},
            "application/json": () => {response.status(200).json(response.person)}
        });
    })
}

// Adds the person id to the peopleFollowing list of the user
// Adds user id to the follower list of the person
function addFollower(request, response) {
    Person.addFollower(request.params.id, request.session.userId, function(err, result) {
        if (err) {
            console.log("Error adding follower.")
            response.status(400).send();
        }

        User.followPerson(request.session.userId, request.params.id, function(err, result) {
            if (err) {
                console.log("Error following person.")
                response.status(400).send();
            }

            response.status(200).send();
        })
    })
}

// Removes the person id to the peopleFollowing list of the user
// Removes user id to the follower list of the person
function removeFollower(request, response) {
    Person.removeFollower(request.params.id, request.session.userId, function(err, result) {
        if (err) {
            console.log("Error removing follower.")
            response.status(400).send();
        }

        User.unfollowPerson(request.session.userId, request.params.id, function(err, result) {
            if (err) {
                console.log("Error unfollowing person.")
                response.status(400).send();
            }

            response.status(200).send();
        })
    })
}

//Export the router object so we can access it in the base app
module.exports = router;