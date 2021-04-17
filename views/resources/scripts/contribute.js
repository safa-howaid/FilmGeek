function addPerson(event) {
    let name = document.getElementById("name").value;
    
    if (!name) {
        alert("You must input a name before submitting.");
        event.preventDefault();
        return;
    }

    // Send request and alert user of result.
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", `/people`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status != 201) {
            alert(this.responseText);
        }
        else if (this.readyState == 4 && this.status == 201){
            let id = this.response
            let response = confirm("Person added successfully! Would you like to be redirected to the person's page?");
            if (response) {
                window.location.href = `/people/${id}`;
                return
            }
            else {
                document.getElementById("name").value = ""
            }
        }
    };
    xhttp.send("name=" + name);
    event.preventDefault();
}

function addMovie(event) {
    let title = document.getElementById("title").value;
    let day = document.getElementById("day").value;
    let month = document.getElementById("month").value;
    let year = document.getElementById("year").value;
    let date = `${day} ${month.substring(0,3)} ${year}`
    let plot = document.getElementById("plot").value;
    let runtime = document.getElementById("runtime").value;
    let actors = actorList.reduce((array, person) => {array.push(person.id); return array}, [])
    let writers = writerList.reduce((array, person) => {array.push(person.id); return array}, [])
    let directors = directorList.reduce((array, person) => {array.push(person.id); return array}, [])

    if (!runtime) {
        alert("Runtime must be a number");
        event.preventDefault();
        return;
    }
    
    // Check for missing fields
    if (!title || !day || !month || !year || !plot || genreList.length == 0 || actorList.length == 0 || writerList.length == 0 || directorList.length == 0) {
        alert("Missing fields! Make sure you've included a title, plot, runtime, release date, and at least one actor, writer, director, and genre.");
        event.preventDefault();
        return;
    }

    let movie = {
        title: title,
        genre: genreList, 
        plot: plot,
        releaseDate: date,
        actors: actors,
        writers: writers,
        directors: directors,
        runtime: runtime + " min"
    }

    // Send request and alert user of result.
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", `/movies`, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 201) { 
            let id = this.response
            let response = confirm("Movie added successfully! Would you like to be redirected to the movie page?");
            if (response) {
                window.location.href = `/movies/${id}`;
                return
            }
            else {
                document.getElementById("title").value = ""
                document.getElementById("plot").value = ""
                document.getElementById("runtime").value = ""
                document.getElementById("actor-search").value = ""
                document.getElementById("writer-search").value = ""
                document.getElementById("director-search").value = ""
                actorList = []
                directorList = []
                writerList = []
                genreList = []
                document.getElementById("actor-search-results").style.display = "none";
                document.getElementById("writer-search-results").style.display = "none";
                document.getElementById("director-search-results").style.display = "none";
                updateDisplay()
            }
        }
        else if (this.readyState == 4 && this.status != 201) { 
            alert("Error adding movie, please try again.");
        }
    };
    xhttp.send(JSON.stringify(movie));
    event.preventDefault();
}

let actorList = [];
let writerList = [];
let directorList = [];
let genreList = [];

function startActorSearch(query) {
    if (query == "") {
        let searchResults = document.getElementById("actor-search-results");
        searchResults.innerHTML = "";
        searchResults.style.display = "none";
    }
    else {
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", `/people?name=${query}`, true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                displayActors(JSON.parse(this.responseText))
            }
        };
        xhttp.send();
    }
}

function startWriterSearch(query) {
    if (query == "") {
        let searchResults = document.getElementById("actor-search-results");
        searchResults.innerHTML = "";
        searchResults.style.display = "none";
    }
    else {
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", `/people?name=${query}`, true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                displayWriters(JSON.parse(this.responseText))
            }
        };
        xhttp.send();
    }
}

function startDirectorSearch(query) {
    if (query == "") {
        let searchResults = document.getElementById("actor-search-results");
        searchResults.innerHTML = "";
        searchResults.style.display = "none";
    }
    else {
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", `/people?name=${query}`, true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                displayDirectors(JSON.parse(this.responseText))
            }
        };
        xhttp.send();
    }
}

function displayActors(searchResults) {
    let names = Object.keys(searchResults);
    let results = document.getElementById("actor-search-results")
    results.style.display = "flex";
    if (names.length == 0) {
        results.innerHTML = `<div class="no-result">No results found.</div>`
    }
    else {
        let html = ""
        names.forEach(name => {
            if (!actorList.some(person => person.name == name)) {
                html += `<div class="search-result-container" onclick="addToActorList('${name}', '${searchResults[name]}')">
                            <label>${name}</label>
                        </div>`
            }
        })
        results.innerHTML = html
    }
}

function displayWriters(searchResults) {
    let names = Object.keys(searchResults);
    let results = document.getElementById("writer-search-results")
    results.style.display = "flex";
    if (names.length == 0) {
        results.innerHTML = `<div class="no-result">No results found.</div>`
    }
    else {
        let html = ""
        names.forEach(name => {
            if (!writerList.some(person => person.name == name)) {
                html += `<div class="search-result-container" onclick="addToWriterList('${name}', '${searchResults[name]}')">
                            <label>${name}</label>
                        </div>`
            }
        })
        results.innerHTML = html
    }
}

function displayDirectors(searchResults) {
    let names = Object.keys(searchResults);
    let results = document.getElementById("director-search-results")
    results.style.display = "flex";
    if (names.length == 0) {
        results.innerHTML = `<div class="no-result">No results found.</div>`
    }
    else {
        let html = ""
        names.forEach(name => {
            if (!directorList.some(person => person.name == name)) {
                html += `<div class="search-result-container" onclick="addToDirectorList('${name}', '${searchResults[name]}')">
                            <label>${name}</label>
                        </div>`
            }
        })
        results.innerHTML = html
    }
}
 
function addToActorList(name, id) {
    if (!actorList.some(person => person.name == name)) {
        actorList.push({id: id, name: name})
    }
    updateDisplay()
}

function removeFromActorList(name) {
    actorList = actorList.filter(person => person.name != name)
    updateDisplay()
}

function addToWriterList(name, id) {
    if (!writerList.some(person => person.name == name)) {
        writerList.push({id: id, name: name})
    }
    updateDisplay()
}

function removeFromWriterList(name) {
    writerList = writerList.filter(person => person.name != name)
    updateDisplay()
}

function addToDirectorList(name, id) {
    if (!directorList.some(person => person.name == name)) {
        directorList.push({id: id, name: name})
    }
    updateDisplay()
}

function removeFromDirectorList(name) {
    directorList = directorList.filter(person => person.name != name)
    updateDisplay()
}

function addToGenreList(selectedGenre) {
    if (!genreList.some(genre => genre == selectedGenre)) {
        genreList.push(selectedGenre)
    }
    updateDisplay()
}

function removeFromGenreList(selectedGenre) {
    genreList = genreList.filter(genre => genre != selectedGenre)
    updateDisplay()
}

function updateDisplay() {
    let actorDisplay = document.getElementById("actor-list")
    let writerDisplay = document.getElementById("writer-list")
    let directorDisplay = document.getElementById("director-list")
    let genreDisplay = document.getElementById("genre-list")

    let html = ""
    actorList.forEach(actor => {
        html += `<div class="selected">
                    <label>${actor.name}</label>
                    <button class="remove-button" type="button" onclick="removeFromActorList('${actor.name}')">X</button>
                 </div>`
    })
    actorDisplay.innerHTML = html

    html = ""
    writerList.forEach(writer => {
        html += `<div class="selected">
                    <label>${writer.name}</label>
                    <button class="remove-button" type="button" onclick="removeFromWriterList('${writer.name}')">X</button>
                </div>`
    })
    writerDisplay.innerHTML = html

    html = ""
    directorList.forEach(director => {
        html += `<div class="selected">
                    <label>${director.name}</label>
                    <button class="remove-button" type="button" onclick="removeFromDirectorList('${director.name}')">X</button>
                </div>`
    })
    directorDisplay.innerHTML = html

    html = ""
    genreList.forEach(genre => {
        html += `<div class="selected">
                    <label>${genre}</label>
                    <button class="remove-button" type="button" onclick="removeFromGenreList('${genre}')">X</button>
                </div>`
    })
    genreDisplay.innerHTML = html
}