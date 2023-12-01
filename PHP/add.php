<!DOCTYPE html>
<html lang="en">

<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="../CSS/add_style.css">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <button id="backbtn">
        <div class="arrow-wrapper">
            <div class="arrow"></div>
        </div>
        Back
    </button>
    <div class="form-container">
        <form action="add.php" method="post" id="addForm">
            <h1>Please enter the user details</h1>
            <p>First Name</p>
            <input type="text" id="fname" name="fname">
            <p>Last Name</p>
            <input type="text" id="lname" name="lname">
            <p>Username</p>
            <input type="text" id="username" name="username">
            <p>Email</p>
            <input type="text" id="email" name="email">
            <p>Password</p>
            <input type="text" id="password" name="password">
            <p>Type of user</p>
            <div class="select-container">
                <select name="usertype" id="usertype">
                    <option value="Admin">Admin</option>
                    <option value="Content Manager">Content Manager</option>
                </select>
            </div>
            <button id="signin">Sign In</button>
            <div id=message>
                <?php
                if ($_SERVER["REQUEST_METHOD"] == "POST") {
                    $fname = $_POST["fname"];
                    $lname = $_POST["lname"];
                    $username = $_POST["username"];
                    $email = $_POST["email"];
                    $password = $_POST["password"];
                    $usertype = $_POST["usertype"];

                    if (empty($fname)) {
                        echo "First name is required. Please fill in the first name.";
                    } elseif (empty($lname)) {
                        echo "Last name is required. Please fill in the last name.";
                    } elseif (empty($username)) {
                        echo "Username is required. Please fill in the username.";
                    } elseif (empty($email)) {
                        echo "Email is required. Please fill in the email.";
                    } elseif (empty($password)) {
                        echo "Password is required. Please fill in the password.";
                    } elseif (empty($usertype)) {
                        echo "User type is required. Please select a user type.";
                    } else {
                        include("database.php");
                        $query = "INSERT INTO users (userid, lname, fname, username, email, password, usertype) VALUES (NULL, ?, ?, ?, ?, ?, ?)";
                        $st = $db->prepare($query);
                        $st->bind_param("ssssss", $lname, $fname, $username, $email, $password, $usertype);
                        $st->execute();
                        $st->close();
                        header('Location:../HTML/admin.html');
                    }
                }
                ?>
            </div>
        </form>

    </div>
    <script>
        // Select the button using its ID
        var backButton = document.getElementById('backbtn');

        // Add a click event listener to the button
        backButton.addEventListener('click', function(event) {
            // Prevent the default action of the button (if it's a submit button)
            event.preventDefault();

            // Use the browser's history API to go back
            window.history.back();
        });
    </script>
</body>

</html>