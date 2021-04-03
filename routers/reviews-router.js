const express = require('express');

//Create the router
let router = express.Router();

router.get('/', (request, response) => {response.send("Reviews Search")})
router.get('/:id', (request, response) => {response.send(`Review ${request.params.id} page`)})

//Export the router object so we can access it in the base app
module.exports = router;