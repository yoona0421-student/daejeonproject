// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// SQLite DB 연결 및 테이블 생성
const db = new sqlite3.Database('./daejeon.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// 게시글 목록 조회
app.get('/api/posts', (req, res) => {
  db.all('SELECT * FROM posts ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 게시글 작성
app.post('/api/report', (req, res) => {
  const { district, content, reportType, imageData } = req.body;
  const posts = loadData();
  const newPost = {
    id: Date.now(),
    district,
    content,
    reportType,
    imageData,
    likes: 0,
    comments: []
  };
  posts.push(newPost);
  saveData(posts);
  res.json({ success: true });
});
