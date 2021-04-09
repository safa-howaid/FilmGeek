function sendReview(event) {
    let rating = document.querySelector('input[name=rating]:checked');
    let summary = document.getElementById("summary").value;
    let fullReview = document.getElementById("fullReview").value;
    
    if (rating == null) {
        alert("You must add a rating before submitting.");
        event.preventDefault();
        return;
    }

    rating = rating.value

    // Send request and alert user of result.
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", `/reviews`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 201) {
            alert("Review added successfully!")
        }
    };
    xhttp.send("reviewer=" + userId + "&movie=" + movieId + "&rating=" + rating + "&summary=" + summary + "&fullReview=" + fullReview)
}

function addToWatchlist() {
    // Send request and alert user of result.
    const xhttp = new XMLHttpRequest();
    xhttp.open("PUT", `/users/${userId}/watchlist`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Added to watchlist successfully!")
            location.reload()
        }
    };
    xhttp.send("movieId=" + movieId)
}

function removeFromWatchlist() {
    // Send request and alert user of result.
    const xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", `/users/${userId}/watchlist`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Removed from watchlist successfully!")
            location.reload()
        }
    };
    xhttp.send("movieId=" + movieId)
}