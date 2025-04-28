const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const bodyParser = require('body-parser');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

let messages = [];

// Load messages if exist
if (fs.existsSync('messages.json')) {
  try {
    messages = JSON.parse(fs.readFileSync('messages.json'));
  } catch (error) {
    console.error('Error parsing messages.json:', error);
    messages = [];
  }
} else {
  // Jika belum ada messages.json, buat file kosong
  fs.writeFileSync('messages.json', JSON.stringify([], null, 2));
  console.log('messages.json dibuat baru.');
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// User page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Admin login page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-login.html'));
});

// Admin dashboard
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Handle admin login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.redirect('/admin/dashboard');
  } else {
    res.send('<script>alert("Login gagal!");window.location="/admin";</script>');
  }
});

// API kirim pesan
app.post('/api/send', (req, res) => {
  const { message, code } = req.body;
  const newMessage = { message, code, time: new Date().toISOString() };
  messages.push(newMessage);
  
  // Simpan ke file
  fs.writeFileSync('messages.json', JSON.stringify(messages, null, 2));

  // Kirim ke admin realtime
  io.emit('messageToAdmin', newMessage);

  res.json({ success: true });
});

// API ambil semua pesan (buat history chat)
app.get('/api/history', (req, res) => {
  res.json({ success: true, messages });
});

// API hapus pesan
app.delete('/api/delete/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (!isNaN(index) && index >= 0 && index < messages.length) {
    messages.splice(index, 1);

    // Update file
    fs.writeFileSync('messages.json', JSON.stringify(messages, null, 2));

    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Index invalid' });
  }
});

// API export semua pesan
app.get('/api/export', (req, res) => {
  res.setHeader('Content-disposition', 'attachment; filename=messages.json');
  res.setHeader('Content-type', 'application/json');
  res.send(JSON.stringify(messages, null, 2));
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected');
});

// Fungsi untuk mendapatkan IP Address lokal
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Jalankan server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on:`);
  console.log(`- http://localhost:${PORT}`);
  console.log(`- http://${getLocalIp()}:${PORT}`);
});
