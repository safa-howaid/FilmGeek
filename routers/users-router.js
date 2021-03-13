const express = require('express');
const path = require('path');
const database = require('../data/database');

//Create the router
let router = express.Router();

router.get('/', (request, response) => {response.send("Users Search")})

router.get('/:id', displayUser)

function displayUser(request, response) {
    let id = request.params.id;
    let person = database.getUserById(id);

    // If movie is not found, send error
    if (person == undefined) {
        response.status(404)
            .send("Page not found")
        return
    }

    // Send rendered movie page
    response.status(200)
        .type('html')
        .render("../views/pages/user", {User: user, database: database});
}
//Export the router object so we can access it in the base app
module.exports = router;