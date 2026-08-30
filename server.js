const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8
});

app.use(express.json({ limit: '100mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// สรรสร้างระบบฐานข้อมูลแบบง่ายด้วยไฟล์ JSON
const DB_FILE = path.join(__dirname, 'results.json');
let studentResults = [];

// ดึงข้อมูลเก่าขึ้นมาถ้ามีไฟล์เซฟไว้
if (fs.existsSync(DB_FILE)) {
  try {
    studentResults = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    studentResults = [];
  }
}

const targetImages = [
  'https://stickershop.line-scdn.net/stickershop/v1/product/11806979/LINEStorePC/main.png?v=1',
  'https://e7.pngegg.com/pngimages/7/432/png-clipart-smiley-emoticon-super-sad-face-game-internet-forum.png',
  'https://img.magnific.com/premium-vector/smiley-emote-smiling-face-icon-cute-smile-sign-happy-emotion-symbol-emoticon-symbol-sign-vector_659151-4937.jpg',
  'https://stickershop.line-scdn.net/stickershop/v1/product/11806979/LINEStorePC/main.png?v=1',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTolyXuxf6llMKoB1n6xbdqQC8pT0fX2AyK8BG9dKuzymL_EADygOXpXFoV&s=10',
  'https://stickershop.line-scdn.net/stickershop/v1/product/12888318/LINEStorePC/main.png?v=1',
  'https://stickershop.line-scdn.net/stickershop/v1/product/8408791/LINEStorePC/main.png?v=1',
  'https://zedth.wordpress.com/wp-content/uploads/2010/06/baby_2_thumb.jpg?w=454&h=342',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIgXk-kSi2tm2pgMa8Xt-hmDGIxGV7rF5WDat6utF3RA&s=10',
  'https://i.pinimg.com/236x/a8/23/80/a823805da4b3c5d7878ae71b0081d121.jpg'
];

app.get('/api/targets', (req, res) => res.json(targetImages));
app.get('/api/results', (req, res) => res.json(studentResults));

app.post('/api/upload', (req, res) => {
  const { studentName, photos } = req.body;
  if (!studentName || !photos || photos.length === 0) {
    return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
  }

  const record = {
    id: Date.now(),
    studentName,
    timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    photos
  };

  studentResults.unshift(record);

  // บันทึกลงฐานข้อมูลไฟล์ JSON
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(studentResults, null, 2));
  } catch (err) {
    console.error('Save error:', err);
  }

  // ยิง Real-time ตรงหาหน้าจอครู
  io.emit('new_submission', record);

  res.json({ success: true });
});

io.on('connection', (socket) => {
  console.log('⚡ มีผู้ใช้งานเชื่อมต่อ:', socket.id);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
