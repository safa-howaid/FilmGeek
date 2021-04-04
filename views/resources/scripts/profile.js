function changeContributionState(event) {
    let isContributer = document.querySelector('input[name=isContributer]:checked').value
    
    // Convert String to Boolean
    isContributer = (isContributer == "true")
    
    // Check that user type is actually different before sending request
    if (user.isContributer == isContributer) {
        let type = "Regular"
        if (user.isContributer) {
            type = "Contributing"
        }
        return alert("You are already a " + type + " user!")
    } 

    // Send request and alert user of result.
    const xhttp = new XMLHttpRequest();
    xhttp.open("PUT", `/users/${user._id}`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onload = function() {
        if (isContributer) {
            alert("You are now a Contributing user!")
        } else {
            alert("You are now a Regular user!")
        }
    }
    xhttp.send("isContributer=" + isContributer)
    event.preventDefault();
}
