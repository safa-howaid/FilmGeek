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

// Initialize the database
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

// Handlers for other resources
app.get('/', (request, response) => {
    response.status(200)
        .type('html')
        .render("../views/pages/homepage", {"movies": database.getPopularMovies()});
});

app.get('/login', (request, response) => {
    response.status(200)
        .type('html')
        .render("../views/pages/login");
});

app.get('/register', (request, response) => {
    response.status(200)
        .type('html')
        .render("../views/pages/register")
});

app.get('/profile', (request, response) => {
    response.status(200)
        .type('html')
        .render("../views/pages/profile", {user: database.getUserById("1"), database: database})
});

app.get('/contribute', (request, response) => {
    response.status(200)
        .type('html')
        .render("../views/pages/contribute")
});

app.listen(port);
console.log("Server listening at http://localhost:3000");


