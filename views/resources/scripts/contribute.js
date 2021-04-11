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
        if (this.readyState == 4) {
            alert(this.responseText);
        }
    };
    xhttp.send("name=" + name);
    event.preventDefault();
}
