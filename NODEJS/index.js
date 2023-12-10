const sql = require('mysql')
const express = require('express')
const path = require('path')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const bodyParser = require('body-parser')
const session = require('express-session')
const io = require('socket.io')

var connection = sql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'agbuyatv'
})

const app = express();
app.use('/media', express.static(path.join(__dirname, 'MEDIA', 'files')));
app.use(express.static('Media'));

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended:true}))

app.use(session({secret:"somesecretkey", resave: true, saveUninitialized: true}))

app.set('view engine','ejs')

app.get("/",function (req,res){
    res.render("logIn.ejs")
})

app.listen(8001, 'localhost')
console.log("Listening at port 8001")

app.post("/login", function(req,res){
  var username = req.body.username
  var password = req.body.password
  connection.query("SELECT * FROM users WHERE password = ? AND username = ? AND usertype = ?",[password,username,"Content Manager"],function(err, results){
    if (err) throw err
    if(results.length>0){
      req.session.user = username
      req.session.userid = results[0].userid
      res.render('contentManager')
    } else {
      
    }
  })
})

app.get('/uploadPage',function(req,res){
  res.render('uploadVideo')
})

app.get('/logout',(req,res)=>{
  req.session.destroy();
  res.render('logIn')
})
app.get('/contentManager', (req, res) => {
  const contentid = req.query.contentid;
  if (contentid) {
      connection.query('SELECT path FROM content WHERE contentid = ?', [contentid], (err, result) => {
          if (err) {
              console.error(err);
              return res.sendStatus(500);
          }

          if (result.length > 0) {
              let videoPath = result[0].path.replace('..\\MEDIA\\files\\', '');
              videoPath = videoPath.replace(/\\/g, '/');
              res.render('contentManager', { videoPath: '/media/' + videoPath });
          } else {
              res.sendStatus(404);
          }
      });
  } else {
      // Render without a specific video
      res.render('contentManager');
  }
});
app.use('/files', express.static(path.join(__dirname, 'MEDIA', 'files')));
app.use(express.static(path.join(__dirname, 'MEDIA')));
app.post('/upload',fileUpload({createParentPath: true}),(req,res)=>{
    if(req.session.user){
    var files = req.files
    Object.keys(files).forEach(key=>{
        const relativeFilePath = path.join('../MEDIA/files',req.body['title']+".mp4")
        const filePath = path.join(__dirname,relativeFilePath)
        files[key].mv(filePath)
        connection.query('INSERT INTO content (contentid, title, duration, timestamp, type, authorid, path) VALUES (NULL, ?,?, CURRENT_TIMESTAMP, ?, ?, ?)',
        [req.body['title'],'00:04:00',"Video",req.session.userid,relativeFilePath]
        )    
    })
    return res.json({status:"Logged",Message:"Logged"})
  } else {
    res.redirect("/")
  }
})

const videoHistoryDir = path.join(__dirname, 'videoHistory');
// Ensure the videoHistory directory exists
if (!fs.existsSync(videoHistoryDir)) {
    fs.mkdirSync(videoHistoryDir, { recursive: true });
}
app.get('/video/:contentid', (req, res) => {
  const contentid = req.params.contentid;
  connection.query('SELECT path FROM content WHERE contentid = ?', [contentid], (err, result) => {
      if (err) {
          console.error(err);
          return res.sendStatus(500);
      }

      if (result.length > 0) {
          // Adjust the path to match the static files middleware
          let videoPath = result[0].path.replace('..\\MEDIA\\files\\', '');
          videoPath = videoPath.replace(/\\/g, '/'); // Ensure forward slashes
          res.sendFile(videoPath, { root: path.join(__dirname, 'MEDIA', 'files') });
      } else {
          res.sendStatus(404);
      }
  });
});
app.get('/video/:filename', (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(__dirname, 'MEDIA', 'files', filename);

  // Check if the file exists before trying to serve it
  if (fs.existsSync(videoPath)) {
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
          // Extract the range info
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
          const chunksize = (end-start)+1;
          const file = fs.createReadStream(videoPath, {start, end});
          const head = {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': 'video/mp4',
          };

          res.writeHead(206, head);
          file.pipe(res);
      } else {
          const head = {
              'Content-Length': fileSize,
              'Content-Type': 'video/mp4',
          };

          res.writeHead(200, head);
          fs.createReadStream(videoPath).pipe(res);
      }
  } else {
      res.sendStatus(404);
  }
});
app.get('/playVideo', (req, res) => {
  const contentid = req.query.contentid;
  connection.query('SELECT * FROM content WHERE contentid = ?', [contentid], (err, result) => {
      if (err) {
          console.error(err);
          return res.sendStatus(500);
      }

      if (result.length > 0) {
          // Assuming the 'path' column in your 'content' table stores the path like '..\MEDIA\files\video.mp4'
          // We strip the leading '..\' and replace backslashes with forward slashes
          const videoPath = result[0].path.replace(/^\.\.\\/, '').replace(/\\/g, '/');
          res.render('contentManager', { videoPath: videoPath });
      } else {
          return res.sendStatus(404);
      }
  });
});
app.get("/videoHistoryList", function(req, res) {
  fs.readdir(videoHistoryDir, (err, files) => {
      if (err) {
          console.error("Could not list the directory.", err);
          res.status(500).send("Server error");
      } else {
          let videoHistory = files
              .filter(file => path.extname(file).toLowerCase() === '.mp4')
              .map(file => {
                  // Remove the .mp4 extension and add .txt for the metadata file
                  const metadataPath = path.join(videoHistoryDir, file.replace('.mp4', '') + '.txt');
                  let timestamp = 'Unknown time';
                  if (fs.existsSync(metadataPath)) {
                      timestamp = fs.readFileSync(metadataPath, 'utf8');
                  }
                  return {
                      name: file,
                      timestamp: timestamp.trim() // Trim whitespace if any
                  };
              });
          res.json(videoHistory);
      }
  });
});



app.get("/videoList", function(req,res){
  if(req.session.user){
  connection.query("SELECT content.title, users.username, content.contentid FROM content JOIN users ON content.authorid = users.userid", function (err,results){
    if (err) throw err;
    res.render('videoList',{results})
  })
  }else{
    res.redirect('/')
  }
})

app.get("/dayUpdate",function(req,res){
  res.render('chooseDay')
})

app.get("/updateSchedule/:day", function(req,res){
  var day = req.params.day
  var query2 = "SELECT schedule.scheduleid, content.title, schedule.timestart, schedule.timeend FROM schedule INNER JOIN content ON content.contentid = schedule.videoid WHERE schedule.day = '"+day+"' ORDER BY schedule.timestart DESC"
  connection.query(query2,function(err,results){
    var result = results
    res.render('showSched',{result,day})
  })
})

app.get("/addSchedulePage/:day", function(req,res){
  connection.query("SELECT * FROM content",function(err,results){
      if(err){
        throw err
      }
      res.render('createSched',{day:req.params.day,results})
  }  
  )
  }
)

//viewer side
app.get("/viewer", function (req, res) {
  res.sendFile(path.join(__dirname, "", "viewer.html"));
});

function convertTime(hours,seconds,meridian){
  if(seconds==''){
    seconds = 0
  }
  if(meridian == 'pm'){
    hours = Number(hours)+12
  }
  var time = hours+":"+seconds+":00"
  return time
}

app.post("/addSchedule/:day", function(req,res){
  var timestart = convertTime(req.body.hour[0],req.body.theMinutes[0],req.body.meridian[0])
  var timeend = convertTime(req.body.hour[1],req.body.theMinutes[1],req.body.meridian[1])
  connection.query("INSERT INTO `schedule` (`scheduleid`, `day`, `videoid`, `timestart`, `timeend`) VALUES (NULL, ?, ?, ?, ?);",
    [req.params.day,req.body.videoId,timestart,timeend]
  )
  var day = req.params.day
  var query2 = "SELECT schedule.scheduleid, content.title, schedule.timestart, schedule.timeend FROM schedule INNER JOIN content ON content.contentid = schedule.videoid WHERE schedule.day = '"+day+"' ORDER BY schedule.timestart DESC"
  connection.query(query2,function(err,results){
    var result = results
    res.render('showSched',{result,day})
  })
}
)

app.post("/deleteSchedule/:id/:day",function(req,res){
  connection.query("DELETE FROM schedule WHERE scheduleid = ?",[req.params.id])
  var day = req.params.day
  connection.query("SELECT schedule.scheduleid, content.title, schedule.timestart, schedule.timeend FROM schedule INNER JOIN content ON content.contentid = schedule.videoid WHERE schedule.day = '"+day+"' ORDER BY schedule.timestart DESC",
    function(err,results){
      var result = results
      res.render('showSched',{result,day})
    })
})

app.post("/backToStart",function(req,res){
  res.render('contentManager')
})

app.post("/deleteVideo/:id",function(req,res){
  console.log(req.params.id)
  connection.query("SELECT path FROM content WHERE contentid = ?",[req.params.id],function(err,results){
    console.log(results)
    fs.unlink(path.join(__dirname,results[0].path),function(err){
      if (err) throw err
      connection.query("DELETE FROM content WHERE contentid = ?",[req.params.id])
      console.log("Sucessfull")
      res.redirect("/videoList")
    })
  })
  
})



