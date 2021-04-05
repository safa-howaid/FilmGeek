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
    xhttp.onload = function() {
        alert("Review added successfully!")
    }
    xhttp.send("reviewer=" + userId + "&movie=" + movieId + "&rating=" + rating + "&summary=" + summary + "&fullReview=" + fullReview)
}