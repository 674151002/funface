const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const studentResults = [];

const targetImages = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500'
];

app.get('/api/targets', (req, res) => {
  res.json(targetImages);
});

app.get('/api/results', (req, res) => {
  res.json(studentResults);
});

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

  // ส่งข้อมูลหาครูแบบ Real-time ทันทีที่เด็กส่งงาน
  io.emit('new_submission', record);

  res.json({ success: true });
});

io.on('connection', (socket) => {
  console.log('⚡ มีผู้ใช้งานเชื่อมต่อ:', socket.id);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
