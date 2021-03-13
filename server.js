const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const database = require('./data/database');

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Serve static resources
app.use(express.static('views/resources'))

database.initDatabase();

//Mount routers for each main resource
let moviesRouter = require("./routers/movies-router");
app.use("/movies", moviesRouter);
let usersRouter = require("./routers/users-router");
app.use("/users", usersRouter);
let peopleRouter = require("./routers/people-router");
app.use("/people", peopleRouter);
let reviewsRouter = require("./routers/reviews-router");
app.use("/reviews", reviewsRouter);

app.get('/', fetchHomepage)
app.get('/login', (request, response) => response.send("Login!"))
app.get('/register', (request, response) => response.send("Register!"))
app.get('/profile', (request, response) => response.send("Profile!"))
app.get('/contribute', (request, response) => response.send("Contribute!"))

app.listen(port);
console.log("Server listening at http://localhost:3000");

function fetchHomepage(request, response) {
    response.send("Homepage!")
}

