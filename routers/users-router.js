const express = require('express');
const path = require('path');
const database = require('../data/database');
const User = require("../data/models/userModel")

//Create the router
let router = express.Router();

router.get('/', (request, response) => {response.send("Users Search")})
router.get('/:id', displayUser)
router.post('/', [validateUserInput, createNewUser])

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