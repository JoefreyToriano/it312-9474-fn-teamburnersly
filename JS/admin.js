function getUsers(searchTerm = "", sortField = null, sortOrder = null) {
  var url = "../PHP/admin.php";
  fetch(url)
    .then(function (response) {
      return response.text();
    })
    .then(function (data) {
      var users = JSON.parse(data);

      // Filter logic
      if (searchTerm) {
        users = users.filter(
          (user) =>
            user.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sorting logic
      if (sortField && sortOrder) {
        users.sort((a, b) => {
          let valA = a[sortField].toLowerCase(); // Convert to lowercase for comparison
          let valB = b[sortField].toLowerCase(); // Convert to lowercase for comparison

          if (valA < valB) return sortOrder === "asc" ? -1 : 1;
          if (valA > valB) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }

      updateUserPanel(users, sortField, sortOrder);
    });
}

function updateUserPanel(users, sortField = null, sortOrder = "asc") {
  const userPanel = document.getElementById("userPanel");
  userPanel.innerHTML = ""; // Clear existing content

  // Create header row
  var headerDiv = document.createElement("div");
  var headers = {
    fname: "First Name",
    lname: "Last Name",
    username: "Username",
    password: "Password",
    email: "Email",
    usertype: "User Type",
    edit: "Edit", // Edit column header
    delete: "Delete", // Delete column header
  };

  Object.keys(headers).forEach((key) => {
    var p = document.createElement("p");
    p.innerHTML = headers[key];
    if (key === sortField && sortOrder) {
      p.innerHTML += sortOrder === "asc" ? " ↑" : " ↓";
    }
    if (key !== "edit" && key !== "delete") {
      p.onclick = () => sortUsers(key);
    }
    headerDiv.appendChild(p);
  });
  userPanel.appendChild(headerDiv);

  // Create and append userDiv with user details
  users.forEach((user) => {
    var userDiv = document.createElement("div");

    // Append user details
    ["fname", "lname", "username", "password", "email", "usertype"].forEach(
      (detail) => {
        var p = document.createElement("p");
        p.innerHTML = user[detail];
        userDiv.appendChild(p);
      }
    );

    // Edit icon (using Font Awesome)
    var aEdit = document.createElement("a");
    aEdit.href = "../PHP/update.php?id=" + user.userid;
    var iEdit = document.createElement("i");
    iEdit.className = "fa-solid fa-pen-to-square"; // Font Awesome pencil icon
    aEdit.appendChild(iEdit);
    userDiv.appendChild(aEdit);

    var aDelete = document.createElement("a");
    aDelete.dataset.userid = user.userid; // Store user ID in a data attribute
    var iDelete = document.createElement("i");
    iDelete.className = "fa fa-trash"; // Font Awesome trash icon
    aDelete.appendChild(iDelete);
    userDiv.appendChild(aDelete);


    userPanel.appendChild(userDiv);
  });
}

function applySearch() {
  var searchTerm = document.getElementById("searchInput").value;
  getUsers(searchTerm);
}
var currentSortState = {
  fname: null,
  lname: null,
  username: null,
  email: null,
  usertype: null,
};
function sortUsers(sortField) {
  var states = [null, "asc", "desc"];
  var currentIndex = states.indexOf(currentSortState[sortField]);
  var nextStateIndex = (currentIndex + 1) % states.length;
  currentSortState[sortField] = states[nextStateIndex];

  // Reset other fields to null
  Object.keys(currentSortState).forEach((key) => {
    if (key !== sortField) currentSortState[key] = null;
  });

  getUsers("", sortField, currentSortState[sortField]);
}
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("searchButton")
    .addEventListener("click", applySearch);
  getUsers();
});

document
  .getElementById("userPanel")
  .addEventListener("click", function (event) {
    if (event.target && event.target.matches(".fa-trash")) {
      event.preventDefault(); // Prevent the default anchor action
      var userId = event.target.closest("a").dataset.userid;
      var confirmDelete = confirm("Are you sure you want to delete this user?");
      if (confirmDelete) {
        window.location.href = "../PHP/delete.php?id=" + userId;
      }
    }
  });
