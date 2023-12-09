<?php
include("database.php");
session_start();
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="../CSS/login_style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css">
</head>

<body>
    <div class="container">
        <div class="image-wrapper">
            <img src="../MEDIA/Login.png" alt="Test Image">
        </div>
        <div id="login">
            <form action="login.php" method="post" id="loginform">
                <h1 id="loginCaption">Welcome to AgbuyaTV!</h1>
                <p>Username/Email</p>
                <div class="input-wrapper">
                    <i class="fa fa-envelope icon"></i>
                    <input type="text" id="username" name="username" placeholder="Email">
                </div>
                <p>Password</p>
                <div class="input-wrapper">
                    <i class="fa fa-key icon"></i>
                    <input type="password" id="password" name="password" placeholder="Password">
                </div>
                <button id="signin">Sign In</button>
                <?php
                if ($_SERVER["REQUEST_METHOD"] == "POST") {
                    $username = filter_input(INPUT_POST, "username", FILTER_SANITIZE_SPECIAL_CHARS);
                    $password = filter_input(INPUT_POST, "password", FILTER_SANITIZE_SPECIAL_CHARS);
                    if (empty($username) && empty($password)) {
                        echo "<p id='error-message'>Please enter your username and password.</p>";
                    } else if (empty($username)) {
                        echo "<p id='error-message'>Your username is empty.</p>";
                    } else if (empty($password)) {
                        echo "<p id='error-message'>Your password is empty.</p>";
                    } else {
                        $stmt = $db->prepare("SELECT * FROM users WHERE username = ? && password = ?");
                        $stmt->bind_param('ss', $username, $password);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        if ($result->num_rows != 0) {
                            $stmt = $db->prepare("SELECT * FROM users WHERE username = ? && password = ?");
                            $stmt->bind_param('ss', $username, $password);
                            $stmt->execute();
                            $stmt->bind_result($id, $lname, $fname, $uname, $email, $pword, $utype);
                            include("dataclasses.php");
                            while ($stmt->fetch()) {
                                if($utype=="Content Manager"){
                                    /*echo
                                    "<script>
                                        const uploadUser = async() =>{
                                        const user = {
                                            id:{$id},
                                            lname:\"$lname\",
                                            fname:\"$fname\",
                                            uname:\"$uname\",
                                            utype:\"$utype\"
                                        }
                                        k = JSON.parse(JSON.stringify(user))
                                        const l = await fetch(\"http://localhost:8001/login\",{
                                            method:'POST',
                                            body: users
                                        })
                                    }
                                    uploadUser()
                                    </script>";*/
                                    echo "<p>Only Admins are allowed here</p>";
                                } else {
                                    $_SESSION['current_user'] = new user($id, $lname, $fname, $uname, $email, $pword, $utype);
                                    $stmt->close();
                                    header('Location:../HTML/admin.php');
                                }
                            }
                        } else {
                            echo "<p>Your credentials are wrong</P>";
                        }
                        $stmt->close();
                    }
                }
                ?>
            </form>
        </div>
    </div>
</body>
</html>