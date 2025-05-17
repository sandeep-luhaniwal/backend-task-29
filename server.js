const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
app.use(cors({
    origin: 'https://to-do-task-28.vercel.app',
    credentials: true,
}));

app.get('/video/:filename', (req, res) => {
  const videoFile = 'sample.mp4'; // Force to always serve this
  const filePath = path.join(__dirname, 'videos', videoFile);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      console.error('File not found or invalid:', err);
      return res.status(404).send('Video file not found');
    }

    const range = req.headers.range;
    if (!range) {
      return res.status(416).send('Requires Range header');
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, stats.size - 1);

    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${stats.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, headers);
    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
