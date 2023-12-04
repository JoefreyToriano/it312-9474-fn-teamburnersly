<?php
include("database.php");
include("dataclasses.php");
$id = $_GET['id'];
$query = "SELECT * FROM users WHERE userid= $id";
$stmt = $db->stmt_init();
$stmt->prepare($query);
$stmt->execute();
$stmt->bind_result($id, $lname, $fname, $uname, $email, $pword, $utype);
$user = null;
while ($stmt->fetch()) {
    $user = new user($id, $lname, $fname, $uname, $email, $pword, $utype);
}
$stmt->close();
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../CSS/update._style.css">
    <title>Document</title>
</head>

<body>
    <button id="backbtn">
        <div class="arrow-wrapper">
            <div class="arrow"></div>
        </div>
        Back
    </button>

    <form action=" " method="post" id="addForm">
        <h1>Please update the user details</h1>
        <p>First Name</p>
        <input type="text" id="fname" value=<?php echo $user->getFirstName() ?> name="fname">
        <p>Last Name</p>
        <input type="text" id="lname" value=<?php echo $user->getLastName() ?> name="lname">
        <p>Username</p>
        <input type="text" id="username" value=<?php echo $user->getUserName() ?> name="username">
        <p>Email</p>
        <input type="text" id="email" value=<?php echo $user->getEmail() ?> name="email">
        <p>Password</p>
        <input type="text" id="password" value=<?php echo $user->getPassword() ?> name="password">
        <p>Type of user</p>
        <select name="usertype" id="usertype">
            <option value="" disabled hidden>Select User Type</option>
            <option value="Admin" <?php echo $user->getUserType() == 'Admin' ? 'selected' : ''; ?>>Admin</option>
            <option value="Content Manager" <?php echo $user->getUserType() == 'Content Manager' ? 'selected' : ''; ?>>Content Manager</option>
        </select>

        <button id="signin">Sign In</button>
    </form>
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
            $query = "UPDATE users SET lname = ?, fname = ?, username = ?, email = ?, password = ?, usertype = ? WHERE users.userid = $id";
            $st = $db->prepare($query);
            $st->bind_param("ssssss", $lname, $fname, $username, $email, $password, $usertype);
            $st->execute();
            $st->close();
            header('Location:../HTML/admin.html');
        }
    }
    ?>
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