<?php
    include("database.php");
    $id = $_GET['id'];
    $query = "DELETE FROM users WHERE users.userid = $id";
    echo $query;
    if($db->query($query)){
        header("Location:admin.php");
    } else{
        echo "Not deleted";
    }
    $db->close();
?>