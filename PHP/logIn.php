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
    <link rel="stylesheet" href="../CSS/style.css">
</head>
<body> 
    <div id="pic">
        <img src="../MEDIA/WhereAlice.jpg">
    </div>
    <div id="login">
        <form action="login.php" method="post" id="loginform">
            <h1 id="loginCaption">WELCOME!</h1>
            <p>Username/Email</p>
            <input type="text" id="username" name="username">
            <p>Password</p>
            <input type="password" id="password" name="password">
            <button id="signin">Sign In</button>
            <?php
                if($_SERVER["REQUEST_METHOD"]=="POST"){
                $username = filter_input(INPUT_POST,"username",FILTER_SANITIZE_SPECIAL_CHARS);
                $password = filter_input(INPUT_POST,"password",FILTER_SANITIZE_SPECIAL_CHARS);
                if(empty($username)) {
                    echo "<p> Your username is empty</p>";
                } elseif(empty($password)) {
                    echo "<p> Your password is empty</p>";
                } else {
                    $stmt = $db->prepare("SELECT * FROM users WHERE username = ? && password = ?");
                    $stmt -> bind_param('ss',$username,$password);
                    $stmt -> execute();
                    $result = $stmt->get_result();
                    if ($result->num_rows!=0){
                        $stmt = $db->prepare("SELECT * FROM users WHERE username = ? && password = ?");
                        $stmt -> bind_param('ss',$username,$password);
                        $stmt -> execute();
                        $stmt -> bind_result($id,$lname,$fname,$uname,$email,$pword,$utype);
                        include("dataclasses.php");
                        while ($stmt->fetch()){
                            $_SESSION['current_user'] = new user($id,$lname,$fname,$uname,$email,$pword,$utype);
                            $stmt->close();
                            header('Location:../HTML/admin.html');
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
</body>
</html>
