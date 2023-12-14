<?php
    include("require_session.php");
?>
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
    <a href="admin.php"><button id="backbtn">
        <div class="arrow-wrapper">
            <div class="arrow"></div>
        </div>
        Back
    </button></a>
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

                    $fname = filter_input(INPUT_POST,"fname",FILTER_SANITIZE_SPECIAL_CHARS);
                    $lname = filter_input(INPUT_POST,"lname",FILTER_SANITIZE_SPECIAL_CHARS);
                    $username = filter_input(INPUT_POST,"username",FILTER_SANITIZE_SPECIAL_CHARS);
                    $email = filter_input(INPUT_POST,"email",FILTER_SANITIZE_SPECIAL_CHARS);
                    $password = filter_input(INPUT_POST,"password",FILTER_SANITIZE_SPECIAL_CHARS);
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
                        $validate = "SELECT * FROM users WHERE username = ? AND usertype = ?";
                        $stmt = $db->prepare($validate);
                        $stmt->bind_param("ss",$username,$usertype);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if($result->num_rows!=0){
                            echo "<script>
                                alert(\"User already exists with the same usertype\")
                            </script>";
                        } else {
                            $query = "INSERT INTO users (userid, lname, fname, username, email, password, usertype) VALUES (NULL, ?, ?, ?, ?, ?, ?)";
                            $st = $db->prepare($query);
                            $st->bind_param("ssssss", $lname, $fname, $username, $email, $password, $usertype);
                            $st->execute();
                            $st->close();
                            header('Location: admin.php');
                        }
                    }
                }
                ?>
            </div>
        </form>
    </div>
</body>

</html>