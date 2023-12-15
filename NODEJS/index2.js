const express = require("express");
const http = require('http');
const socketIO = require('socket.io');
const ffmpeg = require('fluent-ffmpeg');
const NodeMediaServer = require('node-media-server');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/test.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  const nms = new NodeMediaServer({
    rtmp: {
      port: 1935,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60
    }
  });

  nms.run();

  socket.on('stream', (data) => {
    // Forward the stream to RTMP server with stream key
    const streamKey = 'abc123';  // Replace with your actual stream key
    const rtmpUrl = `rtmp://192.168.56.107:1935/live/${streamKey}`;

    const videoTrackSettings = {
      width: 640,  // Adjust based on the video track capabilities
      height: 480,
      frameRate: 30,
      // ... other settings based on your requirements
    };

    const ffmpegCommand = ffmpeg()
      .input('pipe:0')
      .inputFormat('mjpeg')
      .output(rtmpUrl)
      .outputFormat('flv')
      .videoCodec('libx264')  // Adjust based on desired codec
      .size(`${videoTrackSettings.width}x${videoTrackSettings.height}`)
      .fps(videoTrackSettings.frameRate)
      .on('end', () => {
        console.log('ffmpeg process ended');
      })
      .on('error', (err) => {
        console.error('Error in ffmpeg process:', err);
      });

    // Pipe the stream data to ffmpeg and run the command
    ffmpegCommand.input(data).run();
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
