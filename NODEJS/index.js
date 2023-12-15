const sql = require("mysql");
const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const bodyParser = require("body-parser");
const session = require("express-session");
const io = require("socket.io");

var connection = sql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "agbuyatv",
});

const app = express();
const mediaPath = path.join(__dirname, "..", "MEDIA", "files");
app.use("/media", express.static(mediaPath));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({ secret: "somesecretkey", resave: true, saveUninitialized: true })
);

app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("loginCMS.ejs");
});

app.listen(8001, "192.168.1.4");
console.log("Listening at port 8001");

app.post("/login", function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  connection.query(
    "SELECT * FROM users WHERE password = ? AND username = ? AND usertype = ?",
    [password, username, "Content Manager"],
    function (err, results) {
      if (err) throw err;
      if (results.length > 0) {
        req.session.user = username;
        req.session.userid = results[0].userid;
        res.render("contentManager");
      } else {
      }
    }
  );
});

app.get("/uploadPage", function (req, res) {
  res.render("uploadVideo");
});

app.get("/goToLogIn", function (req, res) {
  res.render("logIn");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("logIn");
});
app.get("/contentManager", (req, res) => {
  const contentid = req.query.contentid;
  if (contentid) {
    connection.query(
      "SELECT path FROM content WHERE contentid = ?",
      [contentid],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.sendStatus(500);
        }

        if (result.length > 0) {
          let videoPath = result[0].path.replace("..\\MEDIA\\files\\", "");
          videoPath = videoPath.replace(/\\/g, "/");
          res.render("contentManager", {
            videoPath: "../MEDIA/" + videoPath,
          });
        } else {
          res.sendStatus(404);
        }
      }
    );
  } else {
    // Render without a specific video
    res.render("contentManager");
  }
});
app.use("/files", express.static(path.join(__dirname, "MEDIA", "files")));
app.use(express.static(path.join(__dirname, "MEDIA")));

app.post("/upload", fileUpload({ createParentPath: true }), (req, res) => {
  console.log("Gotten");
  if (req.session.user) {
    var files = req.files;
    Object.keys(files).forEach((key) => {
      let relativeFilePath = path.join(
        "../MEDIA/files",
        req.body["title"] + ".mp4"
      );
      const filePath = path.join(__dirname, relativeFilePath);
      files[key].mv(filePath);
      relativeFilePath = path.join("../" + relativeFilePath);
      console.log(relativeFilePath);
      connection.query(
        "INSERT INTO content (contentid, title, duration, timestamp, type, authorid, path) VALUES (NULL, ?,?, CURRENT_TIMESTAMP, ?, ?, ?)",
        [
          req.body["title"],
          "00:04:00",
          "Video",
          req.session.userid,
          relativeFilePath,
        ]
      );
    });
    return res.json({ status: "Logged", Message: "Logged" });
  } else {
    res.redirect("/");
  }
});

const videoHistoryDir = path.join(__dirname, "videoHistory");
// Ensure the videoHistory directory exists
if (!fs.existsSync(videoHistoryDir)) {
  fs.mkdirSync(videoHistoryDir, { recursive: true });
}
app.get("/video/:contentid", (req, res) => {
  const contentid = req.params.contentid;
  connection.query(
    "SELECT path FROM content WHERE contentid = ?",
    [contentid],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }

      if (result.length > 0) {
        // Adjust the path to match the static files middleware
        let videoPath = result[0].path.replace("..\\MEDIA\\files\\", "");
        videoPath = videoPath.replace(/\\/g, "/"); // Ensure forward slashes
        res.sendFile(videoPath, {
          root: path.join(__dirname, "MEDIA", "files"),
        });
      } else {
        res.sendStatus(404);
      }
    }
  );
});
app.get("/video/:filename", (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(__dirname, "MEDIA", "files", filename);

  // Check if the file exists before trying to serve it
  if (fs.existsSync(videoPath)) {
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Extract the range info
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } else {
    res.sendStatus(404);
  }
});
app.get("/playVideo", (req, res) => {
  const contentid = req.query.contentid;
  connection.query(
    "SELECT * FROM content WHERE contentid = ?",
    [contentid],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }

      if (result.length > 0) {
        // Assuming the 'path' column in your 'content' table stores the path like '..\MEDIA\files\video.mp4'
        // We strip the leading '..\' and replace backslashes with forward slashes
        const videoPath = result[0].path
          .replace(/^\.\.\\/, "")
          .replace(/\\/g, "/");
        res.render("contentManager", { videoPath: videoPath });
      } else {
        return res.sendStatus(404);
      }
    }
  );
});
app.get("/videoHistoryList", function (req, res) {
  fs.readdir(videoHistoryDir, (err, files) => {
    if (err) {
      console.error("Could not list the directory.", err);
      res.status(500).send("Server error");
    } else {
      let videoHistory = files
        .filter((file) => path.extname(file).toLowerCase() === ".mp4")
        .map((file) => {
          // Remove the .mp4 extension and add .txt for the metadata file
          const metadataPath = path.join(
            videoHistoryDir,
            file.replace(".mp4", "") + ".txt"
          );
          let timestamp = "Unknown time";
          if (fs.existsSync(metadataPath)) {
            timestamp = fs.readFileSync(metadataPath, "utf8");
          }
          return {
            name: file,
            timestamp: timestamp.trim(), // Trim whitespace if any
          };
        });
      res.json(videoHistory);
    }
  });
});

app.get("/videoList", function (req, res) {
  if (req.session.user) {
    connection.query(
      "SELECT content.title, users.username, content.contentid FROM content JOIN users ON content.authorid = users.userid",
      function (err, results) {
        if (err) throw err;
        res.render("videoList", { results });
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/dayUpdate", function (req, res) {
  res.render("chooseDay");
});

app.get("/updateSchedule/:day", function (req, res) {
  var day = req.params.day;
  var query2 =
    "SELECT schedule.scheduleid, content.title, schedule.timestart, schedule.timeend FROM schedule INNER JOIN content ON content.contentid = schedule.videoid WHERE schedule.day = '" +
    day +
    "' ORDER BY schedule.timestart DESC";
  connection.query(query2, function (err, results) {
    var result = results;
    res.render("showSched", { result, day });
  });
});

app.get("/addSchedulePage/:day", function (req, res) {
  connection.query("SELECT * FROM content", function (err, results) {
    if (err) {
      throw err;
    }
    res.render("createSched", { day: req.params.day, results });
  });
});
//Query to get the schedule, and to be displayed in CMS
app.get("/scheduleList", (req, res) => {
  const query = "SELECT * FROM schedule ORDER BY day, timestart";
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).send("Server error");
    } else {
      console.log("Schedule Data:", results); // Log the data
      res.json(results);
    }
  });
});



//viewer side
app.get("/viewer", function (req, res) {
  res.sendFile(path.join(__dirname, "", "viewer.html"));
});

function convertTime(hours, seconds, meridian) {
  if (seconds == "") {
    seconds = 0;
  }
  if (meridian == "pm") {
    hours = Number(hours) + 12;
  }
  var time = hours + ":" + seconds + ":00";
  return time;
}

app.post("/addSchedule/:day", function (req, res) {
  var timestart = convertTime(
    req.body.hour[0],
    req.body.theMinutes[0],
    req.body.meridian[0]
  );
  var timeend = convertTime(
    req.body.hour[1],
    req.body.theMinutes[1],
    req.body.meridian[1]
  );
  connection.query(
    "INSERT INTO `schedule` (`scheduleid`, `day`, `videoid`, `timestart`, `timeend`) VALUES (NULL, ?, ?, ?, ?);",
    [req.params.day, req.body.videoId, timestart, timeend]
  );
  var day = req.params.day;
  var query2 =
    "SELECT schedule.scheduleid, content.title, schedule.timestart, schedule.timeend FROM schedule INNER JOIN content ON content.contentid = schedule.videoid WHERE schedule.day = '" +
    day +
    "' ORDER BY schedule.timestart DESC";
  connection.query(query2, function (err, results) {
    var result = results;
    res.render("showSched", { result, day });
  });
});

app.post("/deleteSchedule/:id/:day", function (req, res) {
  connection.query("DELETE FROM schedule WHERE scheduleid = ?", [
    req.params.id,
  ]);
  var day = req.params.day;
  connection.query(
    "SELECT schedule.scheduleid, content.title, schedule.timestart, schedule.timeend FROM schedule INNER JOIN content ON content.contentid = schedule.videoid WHERE schedule.day = '" +
      day +
      "' ORDER BY schedule.timestart DESC",
    function (err, results) {
      var result = results;
      res.render("showSched", { result, day });
    }
  );
});

app.post("/backToStart", function (req, res) {
  res.render("contentManager");
});

app.post("/deleteVideo/:id", function (req, res) {
  console.log(req.params.id);
  connection.query(
    "SELECT path FROM content WHERE contentid = ?",
    [req.params.id],
    function (err, results) {
      console.log(results);
      fs.unlink(path.join(__dirname, results[0].path), function (err) {
        if (err) throw err;
        connection.query("DELETE FROM content WHERE contentid = ?", [
          req.params.id,
        ]);
        console.log("Sucessfull");
        res.redirect("/videoList");
      });
    }
  );
});

app.post("/currentVideo", (req, res) => {
  var date = new Date();
  var currentTime =
    date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  var currentDay = date.getDay();

  if (currentDay === 0) {
    currentDay = "Sunday";
  } else if (currentDay === 1) {
    currentDay = "Monday";
  } else if (currentDay === 2) {
    currentDay = "Tuesday";
  } else if (currentDay === 3) {
    currentDay = "Wednesday";
  } else if (currentDay === 4) {
    currentDay = "Thursday";
  } else if (currentDay === 5) {
    currentDay = "Friday";
  } else if (currentDay === 6) {
    currentDay = "Saturday";
  }
  console.log(currentTime);
  console.log(currentDay);
  query =
    'SELECT videoid FROM schedule WHERE timeend >= "' +
    currentTime +
    '" AND timestart <= "' +
    currentTime +
    '" AND day = "' +
    currentDay +
    '"';
  connection.query(
    query,
    [currentTime, currentTime, currentDay],
    (err, results) => {
      console.log(results);
      if (results.length > 0) {
        console.log("Yay");
        return res.json({ status: 200, message: results[0].videoid });
      } else {
        console.log("Nay");
        return res.json({ status: 200, message: 0 });
      }
    }
  );
});

async function getPathOfVideoById(id) {
  return new Promise((resolve, reject) => {
    const query = "SELECT path FROM content WHERE contentid = ?";
    connection.query(query, [id], function (err, results) {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          resolve(results[0].path);
        } else {
          resolve("../../MEDIA/files/AgbuyaTV.mp4");
        }
      }
    });
  });
}

app.get("/getVideo/:id", async function (req, res) {
  // Ensure there is a range given for the video
  var range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }
  // get video stats (about 61MB)
  var thePath = await getPathOfVideoById(Number(req.params.id));
  const videoPath = __dirname + thePath;
  const videoSize = fs.statSync(videoPath).size;
  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});
