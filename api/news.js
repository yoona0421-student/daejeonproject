
// Vercel 서버리스 함수: 구글 뉴스 RSS를 fetch + jsdom으로 파싱
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
  try {
    const rssUrl = 'https://news.google.com/rss/search?q=%EB%8C%80%EC%A0%84%EC%8B%9C&hl=ko&gl=KR&ceid=KR:ko';
    const response = await fetch(rssUrl);
    const xml = await response.text();
    const dom = new JSDOM(xml, { contentType: 'text/xml' });
    const items = dom.window.document.querySelectorAll('item');
    const newsList = Array.from(items).map(item => ({
      title: item.querySelector('title')?.textContent,
      link: item.querySelector('link')?.textContent,
      pubDate: item.querySelector('pubDate')?.textContent
    }));
    res.status(200).json(newsList);
  } catch (err) {
    res.status(500).json({ error: '뉴스를 불러올 수 없습니다.' });
  }
};
