const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const Person = require("../data/models/personModel")
const Movie = require("../data/models/movieModel");
const session = require('express-session');

//Create the router
let router = express.Router();

router.get('/', (request, response) => {response.send("People Search")})
router.get('/:id', sendPerson)

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
    
    // Send rendered person page or person json data
    response.format({
		"text/html": () => {response.render("../views/pages/person", {person: response.person, loggedIn: request.session.loggedIn})},
		"application/json": () => {response.status(200).json(response.person)}
	});
}

//Export the router object so we can access it in the base app
module.exports = router;