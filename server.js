const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure necessary folders exist
["uploads", "optimized"].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

app.use(express.static('public'));
app.use(require('cors')());

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: 5MB max file size
});

app.post('/optimize', upload.single('gif'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `optimized/${Date.now()}_optimized.gif`;

  const cmd = `gifsicle --optimize=3 --lossy=80 --colors 64 --resize-fit 480x480 --delay=2 ${inputPath} -o ${outputPath}`;

  exec(cmd, (err) => {
    if (err) {
      console.error('Optimization failed:', err);
      return res.status(500).send('Failed to optimize GIF');
    }

    const stats = fs.statSync(outputPath);
    if (stats.size > 5 * 1024 * 1024) {
      return res.status(400).send('Optimized GIF exceeds 5MB');
    }

    res.sendFile(path.resolve(outputPath));
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
