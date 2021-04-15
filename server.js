const express = require('express');
const session = require('express-session')
const path = require('path');
const mongoose = require("mongoose");
const User = require("./data/models/userModel.js")
const Movie = require("./data/models/movieModel.js")
const Review = require("./data/models/reviewModel.js")
const Notification = require("./data/models/notificationModel.js")
const MongoDBStore = require("connect-mongodb-session")(session);
const favicon = require('serve-favicon');
const jsStringify = require('js-stringify');
const morgan  = require('morgan')


const app = express();
const port = 3000;

app.use(morgan('dev'))

const store = new MongoDBStore({
    uri: "mongodb://localhost/FilmGeekDB",
    collection: "sessions"
})

// Create the session
app.use(session({
    secret: "This is a secret",
    resave: true, //save session after every request
    saveUninitialized: false, //stores session if it hasn't been stored
    store: store,
    cookie: { secure: false }
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Serve static resources
app.use(express.static('views/resources'))

// Serve favicon
app.use(favicon(path.join(__dirname,'views','resources','images','favicon.ico')));

// Parse request body data
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// Log Session
app.use(function(req, res, next){
    console.log(req.session);
    next();
})
   
mongoose.connect('mongodb://localhost/FilmGeekDB', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});

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
    Movie.getTopMovies().then(result => {
        response.status(200)
        .type('html')
        .render("../views/pages/homepage", {movies: result, loggedIn: request.session.loggedIn, isContributer: request.session.isContributer});
    })
});

app.get('/login', (request, response) => {
    if(request.session.loggedIn) {
        response.status(401).redirect("profile");
    }
    else if(request.session.errorMessage) {
        const errorMessage = request.session.errorMessage
        request.session.errorMessage = null
        return response.status(400)
        .type('html')
        .render("../views/pages/login", {errorMessage: errorMessage})
    }
    else {
        return response.status(200)
        .type('html')
        .render("../views/pages/login");
    }
});

app.post('/login', (request, response) => {
    const username = request.body.username;
    const password = request.body.password;

    User.findOne({username: username}, function(err, result) {
        if (password == result.password) {
            request.session.loggedIn = true;
            request.session.username = username;
            request.session.userId = result._id;
            request.session.isContributer = result.isContributer;
            response.user = result
            return response.redirect("/profile")
        }
        else {
            request.session.errorMessage = "Username and/or password are incorrect."
            return response.redirect("/login") 
        }
    });
});

app.get('/register', (request, response) => {
    if (request.session.errorMessage) {
        const errorMessage = request.session.errorMessage
        request.session.errorMessage = null
        return response.status(400)
        .type('html')
        .render("../views/pages/register", {errorMessage: errorMessage})
    }

    return response.status(200)
        .type('html')
        .render("../views/pages/register")
});

// Destroy session and redirect to login page
app.get('/logout', (request, response) => {
    request.session.destroy();
    response.redirect("/login")
});


// If logged in, renders profile page
// If not logged in, redirect to login page
app.get('/profile', (request, response) => {
    if (request.session.loggedIn) {
        const errorMessage = request.session.errorMessage
        request.session.errorMessage = null

        User.findOne({username: request.session.username})
        .populate({ 
            path: 'watchlist',
            populate: {
              path: 'actors',
              model: 'Person',
              select: "name"
            }
        })
        .populate("recommendedMovies", "title poster")
        .populate("usersFollowed", "username")
        .populate("peopleFollowed", "name")
        .populate("followers", "username")
        .populate({ 
            path: 'notifications',
            populate: [
                {
                    path: 'user',
                    model: 'User',
                    select: 'username'
                }, 
                {
                    path: 'review',
                    model: 'Review',
                    select: 'movie'
                }
            ]
        })
        .populate({ 
            path: 'reviews',
            populate: {
              path: 'movie',
              model: 'Movie',
              select: "title"
            }
        })
        .exec(function(err, result) {
            console.log(result)
            return response.status(200)
            .type('html')
            .render("../views/pages/profile", {user: result, jsStringify: jsStringify, errorMessage: errorMessage})
        });
    } 
    else {
        return response.status(401).redirect("/login")
    }
});

// If logged in, render contribute page
// If not logged in, redirect to log in page
app.get('/contribute', async (request, response) => {
    if (request.session.isContributer) {
        const genres = await Movie.find().distinct("genre");
        response.status(200)
        .type('html')
        .render("../views/pages/contribute", {isContributer: request.session.isContributer, genres: genres})
    }
    else if (request.session.loggedIn) {
        request.session.errorMessage = "You must be a contributing user to access the contribute page!"
        return response.status(401).redirect("/profile")
    }
    else {
        return response.status(401).redirect("/login")
    }
});

app.listen(port);
console.log("Server listening at http://localhost:3000");


