<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <title>User Management</title>
</head>
<body>
    <iframe src="../HTML/banner.html" width="100%" height="100px" frameborder="0"></iframe>
    <div class="mainContent">
        <div id="contentBox">
            <img src="../MEDIA/alice.jpeg">
            <div class="controlBox">
                <h1>Welcome Alice Celestine</h1>
                <a href="../PHP/add.php"><button>Add User</button></a>
                <a href="../PHP/logout.php"><button>Log Out</button></a>
            </div>
        </div>

        <div class="filterPanel">
            <input type="text" id="searchInput" placeholder="Search by Name, Username, or Email">
            <button id="searchButton">Search</button>
        </div>

        <div id="userPanel"></div>
    </div>
    <?php include "footer.html"; ?>
    <script src="../JS/admin.js"></script>
    <iframe src="../HTML/footer.html" width="100%" height="500px" frameborder="0"></iframe>
</body>
</html>
