const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ปรับขีดจำกัดขนาดข้อมูลเป็น 50MB เพื่อรองรับรูป Base64 ทั้ง 10 รูป
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// ให้บริการไฟล์ HTML จากโฟลเดอร์ public
app.use(express.static(path.join(__dirname, 'public')));

// ตัวแปรเก็บข้อมูลรูปถ่ายของนักเรียนในหน่วยความจำ (In-Memory Data)
const studentResults = [];

// ลิงก์รูปภาพต้นแบบ 10 รูป
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

// API ดึงรูปภาพต้นแบบ
app.get('/api/targets', (req, res) => {
  res.json(targetImages);
});

// API บันทึกผลการเล่นของนักเรียน
app.post('/api/upload', (req, res) => {
  const { studentName, photos } = req.body;
  
  if (!studentName || !photos || photos.length === 0) {
    return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
  }

  const record = {
    id: Date.now(),
    studentName,
    timestamp: new Date().toLocaleString('th-TH'),
    photos
  };

  studentResults.unshift(record); // เก็บบันทึกไว้หน้าสุด
  res.json({ success: true, message: 'บันทึกข้อมูลสำเร็จ' });
});

// API สำหรับระบบครู ดึงผลรวมนักเรียนทุกคน
app.get('/api/results', (req, res) => {
  res.json(studentResults);
});

// กำหนด Port ตามที่ Railway กำหนดให้อัตโนมัติ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server runing on port ${PORT}`);
});