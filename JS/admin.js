function getUsers(){
    var url ='../PHP/admin.php';
    fetch(url).then(function(response){   
        return response.text();
    }).then(function(data){
        users = JSON.parse(data);
        console.log(users);
        var div = document.createElement("div");
        var p = document.createElement("p");
        p.innerHTML = "First Name";
        div.appendChild(p);
        p = document.createElement("p");
        p.innerHTML = "Last Name";
        div.appendChild(p);
        p = document.createElement("p");
        p.innerHTML = "User Name";
        div.appendChild(p);
        p = document.createElement("p");
        p.innerHTML = "Password";
        div.appendChild(p);
        p = document.createElement("p");
        p.innerHTML = "Email";
        div.appendChild(p);
        p = document.createElement("p");
        p.innerHTML = "User type";
        div.appendChild(p);
        document.getElementById("userPanel").appendChild(div);
        users.forEach(user => {
    var userDiv = document.createElement("div");

    // Append user details
    ['fname', 'lname', 'username', 'password', 'email', 'usertype'].forEach(detail => {
        var p = document.createElement("p");
        p.innerHTML = user[detail];
        userDiv.appendChild(p);
    });

    // Container for action icons
    var actionsContainer = document.createElement("div");
    // Delete icon
    var aDelete = document.createElement("a");
    aDelete.href = "../PHP/delete.php?id=" + user.userid;
    var imgDelete = document.createElement("img");
    imgDelete.src = "../MEDIA/Trash.png";
    aDelete.appendChild(imgDelete);
    actionsContainer.appendChild(aDelete);
    // Update icon
    var aUpdate = document.createElement("a");
    aUpdate.href = "../PHP/update.php?id=" + user.userid;
    var imgUpdate = document.createElement("img");
    imgUpdate.src = "../MEDIA/Pencil.png";
    aUpdate.appendChild(imgUpdate);
    actionsContainer.appendChild(aUpdate);

    // Append actions container to the userDiv
    userDiv.appendChild(actionsContainer);

    document.getElementById("userPanel").appendChild(userDiv);
        });
        
    })
}

getUsers();