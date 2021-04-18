function changeContributionState(event) {
    event.preventDefault();
    let isContributer = document.querySelector('input[name=isContributer]:checked').value
    
    // Convert String to Boolean
    isContributer = (isContributer == "true")
    
    // Check that user type is actually different before sending request
    if (user.isContributer == isContributer) {
        let type = "Regular"
        if (user.isContributer) {
            type = "Contributing"
        }
        alert("You are already a " + type + " user!");
        event.preventDefault();
        return;
    }

    // Send request and alert user of result.
    const xhttp = new XMLHttpRequest();
    xhttp.open("PUT", `/users/${user._id}`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (isContributer) {
                alert("You are now a Contributing user!")
            } else {
                alert("You are now a Regular user!")
            }
            window.location.replace("/profile")
        }
    };
    xhttp.send("isContributer=" + isContributer)
}

function removeFromWatchlist(movieId) {
    // Send request and alert user of result.
    const xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", `/users/${user._id}/watchlist`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Removed from watchlist successfully!")
            location.reload()
        }
    };
    xhttp.send("movieId=" + movieId)
}

function notificationLink() {
    var currentUrl = document.URL,
    urlParts = currentUrl.split('#');
    return (urlParts.length > 1);
}

if (notificationLink()) {
    document.getElementById("notification-expand").checked = true;
}