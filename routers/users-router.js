const express = require('express');
const path = require('path');
const database = require('../data/database');

//Create the router
let router = express.Router();

router.get('/', (request, response) => {response.send("Users Search")})
router.get('/:id', displayUser)

function displayUser(request, response) {
    let id = request.params.id;
    let user = database.getUserById(id);

    // If user is not found, send error
    if (user == undefined) {
        response.status(404)
            .send("Page not found")
        return
    }

    // Send rendered user page
    response.status(200)
        .type('html')
        .render("../views/pages/user", {user: user, database: database});
}
//Export the router object so we can access it in the base app
module.exports = router;