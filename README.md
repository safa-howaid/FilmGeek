# Setup Instructions:
- start mongodb instance
- run `npm install` to install the required dependencies 
- run `node data/database-initializer.js` to initialize database
- run `node server.js` to start the server
- open browser to [localhost:3000](http://localhost:3000/) to start at the homepage

# Breakdown of Project files:
- **data folder**
    - A movie data folder that holds the 4 supplied movie data files
    - A data initilization script that populates the database with all the movies and people. It also adds 2 sample users and sample reviews for all movies.
    - A models folder that holds the files that define 5 different resources (users, people, movies, reviews, and notification) and the methods that be used with them

- **routers folder**
    - 4 resources-specific routers that define the requests/responses for the methods of theses resources

- **views folder**
    - Contains all files pertaining to the front-end of the site, it includes:
        - **pages & partials:** Pug templates for every page along with pug reusable code blocks.
        - **resources:** Images, css styles, and scripts for the pages that are served as static files.

- **server.js:** The entry point of the application.

# Supported URLs:
- **[/](http://localhost:3000/)** (Home page)
- **[/login](http://localhost:3000/login)** (Login page)
- **[/register](http://localhost:3000/register)** (Registeration page)
- **[/contribute](http://localhost:3000/contribute)** (Page for adding movies/people (only for contributing users))
- **[/profile](http://localhost:3000/profile)** (The profile page for the logged in user)
- **[/movies](http://localhost:3000/movies)** (Movie search page)
- **/movies/:id** (Movie page for movie with supplied id)
- **/users/:id** (User page for user with supplied id)
- **/people/:id** (Person page for person with supplied id)