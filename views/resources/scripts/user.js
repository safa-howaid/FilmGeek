function unfollow() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", `/users/${currentUser}/usersFollowed`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setTimeout(location.reload(), 5000)
        }
    };
    xhttp.send("userId=" + viewedUser)
    
}

function follow() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", `/users/${currentUser}/usersFollowed`, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setTimeout(location.reload(), 5000);
        }
    };
    xhttp.send("userId=" + viewedUser)
}