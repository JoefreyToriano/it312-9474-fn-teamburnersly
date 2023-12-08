const sql = require('mysql')
const express = require('express')
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs')
var bodyParser = require('body-parser');
const { connect } = require('http2');
const { title } = require('process');


var connection = sql.createConnection({
    host: 'localhost', user: 'root', password: 'Going2Alice', database: ' agbuyatv'
})

const app = express();

app.use(express.static(__dirname));

app.use(express.json())

app.use(express.urlencoded({extended:true}))

app.set('view engine','ejs')

app.get("/",function (req,res){
    res.sendFile(__dirname+"/index.html")
})

app.listen(8001, 'localhost')
console.log("Listening at port 8001")

app.get('/uploadPage',function(req,res){
  res.render('uploadVideo')
})

app.post('/upload',fileUpload({createParentPath: true}),(req,res)=>{
    var files = req.files
    console.log(req.files)
    Object.keys(files).forEach(key=>{
        console.log(key)
        const relativeFilePath = path.join('../MEDIA/files',req.body['title']+".mp4")
        const filePath = path.join(__dirname,relativeFilePath)
        files[key].mv(filePath)
        connection.query('INSERT INTO content (contentid, title, duration, timestamp, type, authorid, path) VALUES (NULL, ?,?, CURRENT_TIMESTAMP, ?, ?, ?)',
        [req.body['title'],'00:04:00',"Video",2,relativeFilePath]
        )    
    })
    return res.json({status:'Logged',Message:'Logged'})
})

app.get("/video", function (req, res) {
    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }

    // get video stats (about 61MB)
    const videoPath = __dirname+"/../MEDIA/files/ReDoin.mp4";
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

app.post("/login", function(req,res){
  console.log(req.body)
  Object.keys(req.body).forEach(key=>{
    console.log(key) 
  })
  console.log("I got the body")
})

app.get("/videoList", function(req,res){
  connection.query("SELECT content.title, users.username FROM content JOIN users ON content.authorid = users.userid", function (err,results){
    if (err) throw err;
    res.render('videoList',{results})
  })
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
  console.log(req.params.day)
  console.log("------------------------------------------------------------------")
  connection.query("SELECT * FROM content",function(err,results){
      console.log(results)
      if(err){
        throw err
      }
      res.render('createSched',{day:req.params.day,results})
  }  
  )
  }
)

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

app.get("/deleteSchedule/:id/:day",function(req,res){
  connection.query("DELETE FROM schedule WHERE scheduleid = ?",[req.params.id])
  var day = req.params.day
  connection.query("SELECT schedule.scheduleid, content.title, schedule.timestart, schedule.timeend FROM schedule INNER JOIN content ON content.contentid = schedule.videoid WHERE schedule.day = '"+day+"' ORDER BY schedule.timestart DESC",
    function(err,results){
      console.log(results)
      var result = results
      res.render('showSched',{result,day})
    })
  })

