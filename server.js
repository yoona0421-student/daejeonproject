

// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const Parser = require('rss-parser');
const parser = new Parser();


const app = express();
app.use(express.static(__dirname)); // 정적 파일 서빙은 app 선언 직후에 위치
const PORT = 4000;

// 구글 뉴스 RSS 크롤링 API
let cachedNews = [];
async function updateNewsCache() {
  try {
    const feed = await parser.parseURL('https://news.google.com/rss/search?q=%EB%8C%80%EC%A0%84%EC%8B%9C&hl=ko&gl=KR&ceid=KR:ko');
    cachedNews = (feed.items || []).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate
    }));
  } catch (err) {
    console.error('뉴스 캐시 업데이트 오류:', err);
  }
}
setInterval(updateNewsCache, 60000); // 1분마다 뉴스 캐시 갱신
updateNewsCache(); // 서버 시작 시 최초 실행

app.get('/api/news', (req, res) => {            
  res.json(cachedNews);
});

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


// ...WebSocket 관련 코드 삭제됨...
