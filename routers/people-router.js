const express = require('express');
const path = require('path');
const database = require('../data/database');

//Create the router
let router = express.Router();

router.get('/', (request, response) => {response.send("People Search")})

router.get('/:id', displayPerson)

function displayPerson(request, response) {
    let id = request.params.id;
    let person = database.getPersonById(id);

    // If movie is not found, send error
    if (person == undefined) {
        response.status(404)
            .send("Page not found")
        return
    }

    // Send rendered movie page
    response.status(200)
        .type('html')
        .render("../views/pages/person", {person: person, database: database});
}

//Export the router object so we can access it in the base app
module.exports = router;