// main.js
// 추후 지도, 클러스터링, 제보 기능 등 JS 추가 예정

// 게시글 목록 불러오기
async function fetchPosts() {
  const res = await fetch('http://localhost:4000/api/posts');
  const posts = await res.json();
  const list = document.getElementById('posts-list');
  list.innerHTML = '';
  posts.forEach(post => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="post-title">${post.title}</span>
      <span class="post-date">${new Date(post.created_at).toLocaleString()}</span>
      <div class="post-content">${post.content}</div>`;
    list.appendChild(li);
  });
}

// 게시글 작성 폼이 없는 경우 오류 방지 (자동 주석 처리)
// document.getElementById('post-form')가 없으면 아래 코드 실행 안함
// if (document.getElementById('post-form')) {
//   document.getElementById('post-form').addEventListener('submit', async function(e) {

// 카테고리별 레이어 항목 분류
const layerCategories = [
  {
    name: '사고 점',
    items: [
      '사고 점(전체: 비보호구역)',
      '클러스터(위험도, 비보호구역)'
    ]
  },
  {
    name: '법규위반',
    items: [
      '법규위반 · 안전운전불이행 (비보호구역)',
      '법규위반 · 보행자보호의무위반 (비보호구역)',
      '법규위반 · 신호위반 (비보호구역)',
      '법규위반 · 기타 (비보호구역)',
      '법규위반 · 중앙선침범 (비보호구역)',
      '법규위반 · 안전거리미확보 (비보호구역)',
      '법규위반 · 교차로운행방법위반 (비보호구역)'
    ]
  },
  {
    name: '노면상태',
    items: [
      '노면상태 · 건조 (비보호구역)',
      '노면상태 · 젖음/습기 (비보호구역)',
      '노면상태 · 습기 (비보호구역)',
      '노면상태 · 서리/결빙 (비보호구역)'
    ]
  },
  {
    name: '기상상태',
    items: [
      '기상상태 · 맑음 (비보호구역)',
      '기상상태 · 비 (비보호구역)',
      '기상상태 · 흐림 (비보호구역)'
    ]
  },
  {
    name: '도로형태',
    items: [
      '도로형태 · 단일로 - 기타 (비보호구역)',
      '도로형태 · 교차로 - 교차로횡단보도내 (비보호구역)',
      '도로형태 · 교차로 - 교차로안 (비보호구역)',
      '도로형태 · 교차로 - 교차로부근 (비보호구역)',
      '도로형태 · 기타 - 기타 (비보호구역)',
      '도로형태 · 단일로 - 횡단보도상 (비보호구역)',
      '도로형태 · 단일로 - 횡단보도부근 (비보호구역)',
      '도로형태 · 단일로 - 고가도로위 (비보호구역)',
      '도로형태 · 주차장 - 주차장 (비보호구역)',
      '도로형태 · 단일로 - 지하차도(도로)내 (비보호구역)'
    ]
  },
  {
    name: '법규위반∧기상상태',
    items: [
      '법규위반∧기상상태 ∧ 안전운전불이행 · 맑음 (비보호구역)',
      '법규위반∧기상상태 ∧ 보행자보호의무위반 · 맑음 (비보호구역)',
      '법규위반∧기상상태 ∧ 신호위반 · 맑음 (비보호구역)',
      '법규위반∧기상상태 ∧ 기타 · 맑음 (비보호구역)',
      '법규위반∧기상상태 ∧ 안전운전불이행 · 비 (비보호구역)',
      '법규위반∧기상상태 ∧ 안전운전불이행 · 흐림 (비보호구역)',
      '법규위반∧기상상태 ∧ 보행자보호의무위반 · 비 (비보호구역)',
      '법규위반∧기상상태 ∧ 중앙선침범 · 맑음 (비보호구역)',
      '법규위반∧기상상태 ∧ 안전거리미확보 · 맑음 (비보호구역)',
      '법규위반∧기상상태 ∧ 신호위반 · 흐림 (비보호구역)',
      '법규위반∧기상상태 ∧ 보행자보호의무위반 · 흐림 (비보호구역)',
      '법규위반∧기상상태 ∧ 교차로운행방법위반 · 맑음 (비보호구역)',
      '법규위반∧기상상태 ∧ 신호위반 · 비 (비보호구역)',
      '법규위반∧기상상태 ∧ 기타 · 비 (비보호구역)',
      '법규위반∧기상상태 ∧ 안전거리미확보 · 흐림 (비보호구역)',
      '법규위반∧기상상태 ∧ 중앙선침범 · 비 (비보호구역)'
    ]
  },
  {
    name: '기타',
    items: [
      '학교·유치원(보조CSV 전체)'
    ]
  }
];

// 카테고리별 체크박스 UI 생성
function renderLayerCheckboxes() {
  const box = document.getElementById('layer-checkbox-list');
  let html = '';
  let layerIdx = 0;
  layerCategories.forEach((cat, catIdx) => {
    html += `<div class="layer-category">
      <div class="category-header" style="display:flex; align-items:center; justify-content:space-between; font-weight:600; font-size:1.08em; margin-bottom:6px;">
        <span>${cat.name}</span>
        <button class="toggle-btn" data-cat="${catIdx}" style="background:#ffe066; border:none; border-radius:8px; padding:2px 12px; font-size:0.98em; cursor:pointer;">더보기</button>
      </div>
      <div class="category-items" data-cat="${catIdx}" style="display:none; flex-direction:column; gap:6px;">
        ${cat.items.map(item => `
          <label style="display:flex; align-items:center; gap:6px; font-size:1em; background:#fff; border-radius:8px; padding:6px 12px; box-shadow:0 1px 4px rgba(0,0,0,0.04);">
            <input type="checkbox" class="layer-checkbox" data-layer="layer${layerIdx++}" checked>
            <span>${item}</span>
          </label>
        `).join('')}
      </div>
    </div>`;
  });
  box.innerHTML = html;
}

// 더보기 버튼 토글 기능
function setupCategoryToggle() {
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const catIdx = this.getAttribute('data-cat');
      const items = document.querySelector(`.category-items[data-cat="${catIdx}"]`);
      if (items.style.display === 'none') {
        items.style.display = 'flex';
        this.textContent = '닫기';
      } else {
        items.style.display = 'none';
        this.textContent = '더보기';
      }
    });
  });
}

// Folium 지도 iframe 내 레이어 제어 JS (postMessage 활용)
function setupLayerControl() {
  const checkboxes = document.querySelectorAll('.layer-checkbox');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', function() {
      const layerId = this.getAttribute('data-layer');
      const checked = this.checked;
      // Folium 지도 iframe에 메시지 전달
      const iframe = document.getElementById('daejeon-map');
      iframe.contentWindow.postMessage({ type: 'layer-control', layerId, checked }, '*');
    });
  });
}

// DOMContentLoaded 시 체크박스 생성 및 이벤트 연결

document.addEventListener('DOMContentLoaded', function() {
  renderLayerCheckboxes();
  setupCategoryToggle();
  setTimeout(setupLayerControl, 500); // iframe 로딩 후 연결
});

// 지도 초기화 예시 (만약 직접 JS에서 Leaflet 지도를 생성한다면 아래처럼 별도 함수로 분리)
// function initMap() {
//   const map = L.map('daejeon-map', {
//     center: [36.3504119, 127.3845475],
//     zoom: 12,
//     zoomControl: false,
//     attributionControl: false
//   });
//   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     opacity: 0.7
//   }).addTo(map);
//
//   // 예시 데이터 (유치원/초등학교 위치 일부)
//   const data = [ ... ];
//   // 클러스터 그룹 생성 및 마커 추가 등...
// }

  // 실시간 뉴스 알림 (네이버 RSS)
  async function fetchNews() {
    // 네이버 뉴스 RSS (대전 keyword)
    const rssUrl = 'https://news.google.com/rss/search?q=%EB%8C%80%EC%A0%84+%EC%95%88%EC%A0%84+%EC%86%8C%EC%8B%9D&hl=ko&gl=KR&ceid=KR:ko';
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(rssUrl);
    try {
      const res = await fetch(proxyUrl);
      // ...뉴스 데이터 처리 코드...
    } catch (err) {
      console.error('뉴스 데이터 fetch 중 오류:', err);
    }
  }

// 게시글 렌더링 함수 예시 (템플릿 리터럴 오류 수정)
function renderPosts(posts, districtSelect, postsContainer) {
  posts.forEach(post => {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
      ${post.imageData ? `<img src="${post.imageData}" alt="첨부 이미지">` : ''}
      <div class="meta">
        <span class="type">${post.reportType || ''}</span>
        <span class="district">${post.district}</span>
        <span class="date">${post.date ? post.date : ''}</span>
      </div>
      <div class="content">${post.content}</div>
      <div>좋아요: <span class="like-count">${post.likes}</span> <button class="like-btn">👍</button></div>
      <div>
        <b>댓글</b>
        <ul class="comments">
          ${post.comments.map(c => `<li>${c}</li>`).join('')}
        </ul>
        <input type="text" class="comment-input" placeholder="댓글 작성" />
        <button class="comment-btn">댓글 등록</button>
      </div>
    `;
    // 좋아요 버튼
    postDiv.querySelector('.like-btn').onclick = async () => {
      await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      loadPosts(districtSelect.value);
    };
    // 댓글 등록
    postDiv.querySelector('.comment-btn').onclick = async () => {
      const input = postDiv.querySelector('.comment-input');
      const comment = input.value.trim();
      if (comment) {
        await fetch(`/api/posts/${post.id}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment })
        });
        input.value = '';
        loadPosts(districtSelect.value);
      }
    };
    postsContainer.appendChild(postDiv);
  });
}

  function renderMiniNews(newsList) {
    const container = document.getElementById('mini-news-list');
    container.innerHTML = '';
    if (!newsList || newsList.length === 0) {
      container.innerHTML = '<div style="padding:16px; color:#888;">대전 관련 실시간 뉴스가 없습니다.</div>';
      return;
    }
    newsList.forEach(news => {
      const div = document.createElement('div');
      div.className = 'mini-news-item';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.gap = '10px';
      div.style.marginBottom = '10px';
      div.innerHTML = `<img src="${news.thumb}" style="width:28px; height:28px; border-radius:6px; object-fit:cover; box-shadow:0 1px 4px rgba(0,0,0,0.08);" alt="썸네일"> <a href="${news.link}" target="_blank" style="text-decoration:none;color:#222;font-weight:500;">${news.title}</a>`;
      container.appendChild(div);
    });
  }

  // 페이지 로드 시 뉴스 불러오기
  window.addEventListener('DOMContentLoaded', fetchNews);

  // 안전 제보하기 모달 제어
  window.addEventListener('DOMContentLoaded', () => {
    const reportBtn = document.getElementById('report-btn');
    const modal = document.getElementById('report-modal');
    const overlay = document.getElementById('report-modal-overlay');
    const closeBtn = document.getElementById('report-modal-close');
    const cancelBtn = document.getElementById('report-cancel');
    const photoArea = document.getElementById('report-photo-area');
    const photoInput = document.getElementById('report-photo');
    const photoLabel = document.getElementById('report-photo-label');

    function openModal() {
      modal.style.display = 'block';
      overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      modal.style.display = 'none';
      overlay.style.display = 'none';
      document.body.style.overflow = '';
      photoInput.value = '';
      photoLabel.textContent = '사진을 드래그하거나 클릭하여 업로드';
    }
    if (reportBtn) reportBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // 사진 첨부
    if (photoArea) {
      photoArea.addEventListener('click', () => photoInput && photoInput.click());
      photoArea.addEventListener('dragover', e => {
        e.preventDefault();
        photoArea.style.background = '#f5f5f5';
      });
      photoArea.addEventListener('dragleave', e => {
        e.preventDefault();
        photoArea.style.background = '';
      });
      photoArea.addEventListener('drop', e => {
        e.preventDefault();
        photoArea.style.background = '';
        if (photoInput && e.dataTransfer.files.length > 0) {
          photoInput.files = e.dataTransfer.files;
          if (photoLabel) photoLabel.textContent = e.dataTransfer.files[0].name;
        }
      });
    }
    if (photoInput) {
      photoInput.addEventListener('change', e => {
        if (photoInput.files.length > 0 && photoLabel) {
          photoLabel.textContent = photoInput.files[0].name;
        } else if (photoLabel) {
          photoLabel.textContent = '사진을 드래그하거나 클릭하여 업로드';
        }
      });
    }

    // 제보하기 버튼 (실제 서버 연동은 미구현, 알림만)
    var reportSubmitBtn = document.getElementById('report-submit');
    if (reportSubmitBtn) {
      reportSubmitBtn.addEventListener('click', () => {
        alert('제보가 등록되었습니다! (데모)');
        closeModal();
      });
    }
  });

document.addEventListener('DOMContentLoaded', function() {
  // ...existing code for 지도, 뉴스 등...
  // 안전 제보하기 버튼 및 모달 동작은 window.addEventListener('DOMContentLoaded', ...)에서만 처리

  // 사진 첨부 기능
  if (imageDropZone && imageInput) {
    imageDropZone.onclick = function() {
      imageInput.click();
    };
    imageDropZone.ondragover = function(e) {
      e.preventDefault();
      imageDropZone.style.background = '#e0e7ff';
    };
    imageDropZone.ondragleave = function(e) {
      e.preventDefault();
      imageDropZone.style.background = '#fafafa';
    };
    imageDropZone.ondrop = function(e) {
      e.preventDefault();
      imageDropZone.style.background = '#fafafa';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        imageInput.files = e.dataTransfer.files;
        handleImageUpload(e.dataTransfer.files[0]);
      }
    };
    imageInput.onchange = function(e) {
      if (e.target.files && e.target.files[0]) {
        handleImageUpload(e.target.files[0]);
      }
    };
  }

  // 이미지 업로드 핸들러
  function handleImageUpload(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      previewImage.style.display = 'block';
      previewImage.innerHTML = '<img src="' + e.target.result + '" style="max-width:100%; max-height:80px; border-radius:8px;">';
      imageDropText.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  // 폼 제출
  if (reportForm) {
    reportForm.onsubmit = function(e) {
      e.preventDefault();
      var reportType = document.getElementById('reportType').value;
      var district = document.getElementById('district').value;
      var content = document.getElementById('content').value.trim();
      var imageData = '';
      if (imageInput && imageInput.files && imageInput.files[0]) {
        var reader = new FileReader();
        reader.onload = function(ev) {
          imageData = ev.target.result;
          saveReport(reportType, district, content, imageData);
        };
        reader.readAsDataURL(imageInput.files[0]);
      } else {
        saveReport(reportType, district, content, '');
      }
    };
  }

  // 제보 저장 함수
  function saveReport(reportType, district, content, imageData) {
  if (!content || !reportType || !district) return;
  var reports = JSON.parse(localStorage.getItem('reports') || '[]');
  // 고유 id 생성 (timestamp + 랜덤)
  var uniqueId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  reports.push({ id: uniqueId, reportType: reportType, district: district, content: content, imageData: imageData, date: new Date().toLocaleString() });
  localStorage.setItem('reports', JSON.stringify(reports));
  reportModal.style.display = 'none';
  reportForm.reset();
  previewImage.style.display = 'none';
  imageDropText.style.display = 'block';
  imageInput.value = '';
  alert('제보가 등록되었습니다!');
  }
});

function renderTop5Risk() {
  var top5 = [
    { rank: 1, emoji: '⚠️', area: '서구 둔산동', type: '교통 위험', count: 8 },
    { rank: 2, emoji: '🏠', area: '유성구 봉명동', type: '시설 위험', count: 6 },
    { rank: 3, emoji: '⚠️', area: '대덕구 신탄진동', type: '교통 위험', count: 5 },
    { rank: 4, emoji: '🏠', area: '서구 괴정동', type: '시설 위험', count: 4 },
    { rank: 5, emoji: '💠', area: '중구 대사동', type: '기타', count: 3 }
  ];
  var html = '<div class="card" style="border:1px solid #ffe066; border-radius:12px; padding:12px; margin-bottom:12px; background:#fffbe6;">';
  html += '<div style="font-weight:bold; color:#e89c1d; margin-bottom:6px; border-bottom:1px dashed #ffe066; padding-bottom:4px;">위험지역 <span style="color:#e89c1d;">TOP5</span></div>';
  html += '<ol style="padding-left:18px; margin:0;">';
  top5.forEach(function(item) {
    html += '<li style="margin-bottom:2px;">';
    html += '<span style="font-size:18px; vertical-align:middle;">' + item.emoji + '</span> ';
    html += '<span style="color:' + (item.rank === 1 ? '#e89c1d' : item.rank === 2 ? '#b8860b' : item.rank === 3 ? '#e89c1d' : item.rank === 4 ? '#b8860b' : '#1e90ff') + '; font-weight:' + (item.rank <= 3 ? 'bold' : 'normal') + ';">' + item.area + '</span> ';
    html += item.type + ' ' + item.count + '건';
    html += '</li>';
  });
  html += '</ol></div>';
  var el = document.getElementById('top5RiskBox');
  if (el) el.innerHTML = html;
}



// 기존 실시간 뉴스 알림 박스(mini-news-list)에 뉴스 렌더링
async function loadMiniNewsList() {
  try {
    const res = await fetch('/api/news');
    const newsList = await res.json();
    const container = document.getElementById('mini-news-list');
    if (!container) return;
    if (!newsList || newsList.length === 0) {
      container.innerHTML = '<div style="padding:16px; color:#888;">대전 관련 실시간 뉴스가 없습니다.</div>';
      return;
    }
    container.innerHTML = newsList.map(news =>
      `<div style="margin-bottom:18px;">
        <a href="${news.link}" target="_blank" style="font-weight:500;color:#1976d2;text-decoration:none;">${news.title}</a><br>
        <span style="font-size:0.95em;color:#888;">${news.pubDate}</span>
      </div>`
    ).join('');
  } catch (err) {
    if (document.getElementById('mini-news-list')) {
      document.getElementById('mini-news-list').innerHTML = '<div style="color:red;">뉴스를 불러올 수 없습니다.</div>';
    }
  }
}
window.addEventListener('DOMContentLoaded', loadMiniNewsList);
