const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const bodyParser = require('body-parser');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

let messages = [];

// Load messages if exist
if (fs.existsSync('messages.json')) {
  messages = JSON.parse(fs.readFileSync('messages.json'));
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
  fs.writeFileSync('messages.json', JSON.stringify(messages, null, 2));
  io.emit('messageToAdmin', newMessage);
  res.json({ success: true });
});

// API ambil semua pesan
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// API hapus pesan
app.delete('/api/delete/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (!isNaN(index) && index >= 0 && index < messages.length) {
    const deletedMessage = messages.splice(index, 1)[0];
    fs.writeFileSync('messages.json', JSON.stringify(messages, null, 2));
    io.emit('deleteMessage', index); // Emit event delete
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Index invalid' });
  }
});

// API export semua pesan (JSON)
app.get('/api/export/json', (req, res) => {
  res.setHeader('Content-disposition', 'attachment; filename=messages.json');
  res.setHeader('Content-type', 'application/json');
  res.send(JSON.stringify(messages, null, 2));
});

// API export semua pesan (CSV)
app.get('/api/export/csv', (req, res) => {
  let csv = 'Message,Code,Time\n';
  messages.forEach(msg => {
    csv += `"${msg.message.replace(/"/g, '""')}", "${msg.code}", "${msg.time}"\n`;
  });

  res.setHeader('Content-disposition', 'attachment; filename=messages.csv');
  res.set('Content-Type', 'text/csv');
  res.status(200).send(csv);
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected');
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
