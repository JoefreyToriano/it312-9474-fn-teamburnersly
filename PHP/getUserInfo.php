<?php
include("database.php");
include("dataclasses.php");
$query = "SELECT * FROM users";
$stmt = $db->stmt_init();
$stmt->prepare($query);
$stmt->execute();
$stmt->bind_result($id, $lname, $fname, $uname, $email, $pword, $utype);
$users = array();
while ($stmt->fetch()) {
    $user = new user($id, $lname, $fname, $uname, $email, $pword, $utype);
    array_push($users, $user);
}
$stmt->close();
$json = json_encode($users);
echo $json;

?>
