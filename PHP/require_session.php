<?php
    session_start();
    if(!isset($_SESSION['current_user'])){
        header('Location:logIn.php');
        return;
    }
?>