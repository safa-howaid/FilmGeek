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

router.get('/', getPeople)
// Retrieve a person page/json
router.get('/:id', sendPerson)
// Add follower
router.post('/:id/followers', addFollower)
// Remove follower
router.delete('/:id/followers', removeFollower)
// Add Person
router.post('/', addPerson)

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
    .populate("actingRoles")
    .populate("writingRoles")
    .populate("directingRoles")
    .populate("frequentCollaborators", "name")
    .populate({
        path: 'actingRoles',
        populate: {
          path: 'actors',
          model: 'Person',
          select: "name"
        }
    })
    .populate({
        path: 'writingRoles',
        populate: {
          path: 'actors',
          model: 'Person',
          select: "name"
        }
    })
    .populate({
        path: 'directingRoles',
        populate: {
          path: 'actors',
          model: 'Person',
          select: "name"
        }
    })
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

function getPeople(request, response) {
    const filter = {name: {$regex: new RegExp("^" + request.query.name + ".*") , $options: "i"}};
    const fields = null;
    const options = {
        limit: 5,
    }
    Person.find(filter, fields, options).then(people => {
        let searchResults = people.reduce((object, person) => {object[person.name] = person._id; return object} , {})
        response.status(200).json(searchResults)
    })
}

// Send a single person page/object
function sendPerson(request, response) {
    // Check if user follows person and send rendered person page or person json data
    User.isFollowingPerson(request.session.userId, request.params.id).then(isFollowing => {
        response.format({
            "text/html": () => {response.render("../views/pages/person", {person: response.person, loggedIn: request.session.loggedIn, isFollowing: isFollowing, userId: request.session.userId, jsStringify: jsStringify, isContributer: request.session.isContributer})},
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

async function addPerson(request, response) {
    //Get the name and convert it to a string of lowercase letters with each word starting with a capital
    let words = request.body.name.toLowerCase().split(" ");
    let name = [];
    words.forEach(word => {
        word = word[0].toUpperCase() + word.substring(1);
        name.push(word);
    })
    name = name.join(" ");

    // Check if person exists and return error to client
    let exists = await Person.exists({ name: { $regex: new RegExp("^" + name + "$", "i")}});

    if (exists) {
        return response.status(409).send("Person already exists");
    }

    // Create the new person and return success to client
    let newPerson = new Person({name: name});
    newPerson.save(function (err, result) {
        if (err) {
            return response.status(400).send("Error saving new person!");
        }
        return response.status(201).send(String(newPerson._id));
    })
}

//Export the router object so we can access it in the base app
module.exports = router;