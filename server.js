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

const DB_FILE = path.join(__dirname, 'results.json');
let teamResults = [];

if (fs.existsSync(DB_FILE)) {
  try {
    teamResults = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    teamResults = [];
  }
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(teamResults, null, 2));
  } catch (err) {
    console.error('Save DB error:', err);
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
app.get('/api/results', (req, res) => res.json(teamResults));

// ส่งรูปภาพทีละ 1 รูปทันทีแบบ Real-time
app.post('/api/upload-photo', (req, res) => {
  const { teamName, photo, photoIndex } = req.body;
  if (!teamName || !photo) {
    return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
  }

  let team = teamResults.find(t => t.teamName === teamName);
  if (!team) {
    team = {
      id: Date.now(),
      teamName,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      photos: Array(10).fill(null)
    };
    teamResults.unshift(team);
  }

  team.photos[photoIndex] = photo;
  team.timestamp = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  saveDB();

  io.emit('team_updated', team);
  res.json({ success: true, team });
});

// เพิ่มทีมใหม่โดยครู
app.post('/api/results', (req, res) => {
  const { teamName } = req.body;
  if (!teamName) return res.status(400).json({ success: false });

  const newTeam = {
    id: Date.now(),
    teamName,
    timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    photos: Array(10).fill(null)
  };
  teamResults.unshift(newTeam);
  saveDB();

  io.emit('team_added', newTeam);
  res.json({ success: true, team: newTeam });
});

// แก้ไขชื่อทีม
app.put('/api/results/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { teamName } = req.body;
  const team = teamResults.find(t => t.id === id);
  
  if (team) {
    team.teamName = teamName;
    saveDB();
    io.emit('team_updated', team);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

// ลบทีม
app.delete('/api/results/:id', (req, res) => {
  const id = parseInt(req.params.id);
  teamResults = teamResults.filter(t => t.id !== id);
  saveDB();

  io.emit('team_deleted', id);
  res.json({ success: true });
});

io.on('connection', (socket) => {
  console.log('⚡ มีผู้ใช้งานเชื่อมต่อ:', socket.id);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
