function unfollow() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", `/people/${personId}/followers`, true);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setTimeout(location.reload(), 5000)
        }
    };
    xhttp.send()
    
}

function follow() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", `/people/${personId}/followers`, true);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setTimeout(location.reload(), 5000);
        }
    };
    xhttp.send()
}