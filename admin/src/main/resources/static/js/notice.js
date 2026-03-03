function filterBranch(branch) {
  // 1. 활성 탭 디자인 변경
  const btns = document.querySelectorAll('.tab-btn');
  btns.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  // 2. 리스트 필터링
  const items = document.querySelectorAll('.notice-item');
  
  items.forEach(item => {
    if (branch === 'all' || item.getAttribute('data-branch') === branch) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
  }
  });
}

function toggleAccordion(header) {
  const item = header.parentElement;
  
  // 선택한 것 외에 다른 공지사항은 닫고 싶을 때 (옵션)
  document.querySelectorAll('.notice-item').forEach(li => {
      if (li !== item) li.classList.remove('active');
  });
  
  item.classList.toggle('active');
}


// 1. 서버에서 공지사항 데이터를 가져오는 함수
async function fetchNotices(branch = 'all') {
    try {
        // 실제로는 서버 주소를 넣습니다.
        const response = await fetch(`https://api.example.com/notices?branch=${branch}`);
        const data = await response.json(); // JSON 형태로 변환
        
        renderNotices(data); // 데이터를 화면에 그리는 함수 호출
    } catch (error) {
        console.error("데이터 로드 실패:", error);
    }
}

// 2. 가져온 데이터를 HTML로 변환해서 뿌려주는 함수 (DOM 조작)
function renderNotices(notices) {
  const listElement = document.getElementById('noticeList');
  
  // 기존 리스트 비우기
  listElement.innerHTML = '';

  // 데이터 수만큼 반복해서 HTML 생성
  notices.forEach(item => {
    const li = document.createElement('li');
    li.className = 'notice-item';
    li.innerHTML = `
      <a href="/notice/${item.id}">
        <span class="branch-tag">${item.branch}</span>
        <div class="info">
          <p class="title">${item.title}</p>
          <span class="date">${item.date}</span>
        </div>
      </a>
    `;
    listElement.appendChild(li);
  });
}

// 3. 페이지가 처음 로드될 때 '전체' 데이터를 가져옴
window.onload = () => fetchNotices('all');