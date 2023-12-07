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
  let v
  connection.query("SELECT * FROM schedule", function (err,results){
    if (err) throw err;
    v = results
    console.log(results)
  })
  res.send(v)
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
  const titles = [
    {title:"The daughter of the Sun and Moon", id:7},
    {title:"The tower",id: 8},
    {title:"The great war",id: 11},
    {title:"Reality Break",id: 13},
    {title:"The fall",id: 14},
    {title:"The end of all things",id: 15}
  ];
  console.log(titles)
  res.render('createSched',{day:req.params.day,titles})}
  
)

app.post("/addSchedule/:day", function(req,res){
  console.log(req.body)
  var timestart
  var timeend

  connection.query("INSERT INTO `schedule` (`scheduleid`, `day`, `videoid`, `timestart`, `timeend`) VALUES (NULL, ?, ?, ?, ?);",
    [req.params.day,req.params.videoid,req.params.timestart,req.params.timeend]
  )
}
)

app.post("/deleteSchedule/:id",function(req,res){
  connection.query()
})

