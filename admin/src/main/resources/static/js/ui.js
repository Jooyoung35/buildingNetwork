
let tabSwipers ={};

const buildingNames = {
  cheonggye: '청계한국빌딩',
  eulji: '을지한국빌딩',
  sogong: '소공한국빌딩',
  jongro: '종로한국빌딩'
};

const mapSelectorByTab = {
    cheonggye: '.map-cheonggye',
    eulji: '.map-eulji',
    sogong: '.map-sogong',
    jongro: '.map-jongro',
};

const centerByTab = {
    cheonggye: { lat: 37.5694616, lng: 126.978752 },
    eulji:     { lat: 37.5656459, lng: 126.9833533    },
    sogong:    { lat: 37.5641542,  lng: 126.9811848    },
    jongro:    { lat: 37.5698444,  lng: 126.9811096    },
};

// DESTINATIONS 메타 정보 (탭 id 기준) 애는 selector 와 name 도 같이. 흠... 쫌....
const destinationInfoByTab = {
  jukdo: {
    selector: '#jukdo #map',
    lat: 36.2760727,
    lng: 126.5381458,
    name: '죽도 상화원',
  },

  donggeomdo: {
    selector: '#donggeomdo #map',
    lat: 37.5816127,
    lng: 126.5162822,
    name: '동검도 한국빌라',
  },
};


// ui.js에서 실행될 메인 함수
function initPageUI() {
    initBuildingTabs();
    initDestinationMaps();
}

// [추가된 빌딩 탭 로직]--------
function initBuildingTabs() {
    const tabs = document.querySelectorAll('.tab-wrapper li');
    const contents = document.querySelectorAll('.tab-content');
    const indicator = document.querySelector('.tab-indicator');

    if (!tabs.length || !indicator) return;

    function updateIndicator(target) {
        const ratio = 0.5; 
        const width = target.offsetWidth * ratio; 
        const left = target.offsetLeft + (target.offsetWidth - width) / 2; 
        indicator.style.width = `${width}px`; 
        indicator.style.left = `${left}px`;
    }

    // [추가] URL에서 어떤 탭을 열지 파라미터를 가져옵니다. (예: ?tab=eulji)
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');

    // 파라미터가 있으면 해당 탭을, 없으면 기존처럼 active나 첫 번째 탭 선택
    let initialTab = tabs[0];
    if (tabParam) {
        const targetTab = document.querySelector(`.tab-wrapper li[data-tab="${tabParam}"]`);
        if (targetTab) initialTab = targetTab;
    } else {
        initialTab = document.querySelector('.tab-wrapper li.active') || tabs[0];
    }

    // 초기 활성화 처리
    function activateTab(target) {
        const targetId = target.dataset.tab;
        
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        target.classList.add('active');
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add('active');

            if (tabSwipers[targetId]) {
                tabSwipers[targetId].update();
                tabSwipers[targetId].autoplay.start();
            }

            // 빌딩 탭 전환 시 해당 지도 리프레시
        // - 처음 클릭하는 탭이면 createBuildingMap으로 한 번만 생성
        // - 이미 만들어진 탭이면 relayout + setCenter만 수행 (잔상 방지)
        if (window.buildingMaps && typeof window.createBuildingMap === 'function') {

            const selector = mapSelectorByTab[targetId];
            const center = centerByTab[targetId];

            if (selector && center) {
                const existingMap = window.buildingMaps[selector];
                if (!existingMap) {
                    // 아직 생성 안 된 탭이면 최초 1회 생성
                    window.createBuildingMap(selector, center.lat, center.lng);
                } else if (existingMap.relayout) {
                    // 이미 생성된 지도는, 탭 내용이 display:block으로 바뀐 뒤에 레이아웃 재계산
                    setTimeout(function () {
                        const currentCenter = existingMap.getCenter();
                        existingMap.relayout();
                        // 중심이 틀어지지 않도록 한 번 더 세팅
                        existingMap.setCenter(
                            currentCenter || new kakao.maps.LatLng(center.lat, center.lng)
                        );
                    }, 100);
                }
            }
        }

        // 인디케이터 이동 (약간의 지연을 주면 더 정확하게 )
        setTimeout(() => updateIndicator(target), 50);
    }
    // [Swiper 초기화 함수 호출] --------------------------------------
    initAllSwipers(); 
    
    if (initialTab) activateTab(initialTab);

    // 클릭 이벤트
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            activateTab(this);
            // 클릭 시 URL도 변경하고 싶다면 (선택사항)
            // history.replaceState(null, null, `?tab=${this.dataset.tab}`);
        });
    });

    window.addEventListener('resize', () => {
        const activeTab = document.querySelector('.tab-wrapper li.active');
        if (activeTab) updateIndicator(activeTab);
    });



    function initAllSwipers() {
    // 각 탭 컨텐츠(#jukdo, #donggeomdo 등)를 돌면서 슬라이더를 찾습니다.
    document.querySelectorAll('.tab-content').forEach((content) => {
        const tabId = content.id;
        const swiperElement = content.querySelector('.mySwiper');

        if (swiperElement) {
            // tabSwipers['jukdo'] = new Swiper(...) 이런 식으로 저장됩니다.
            tabSwipers[tabId] = new Swiper(swiperElement, {
                autoplay: { delay: 3000, disableOnInteraction: false },
                navigation: {
                    nextEl: content.querySelector('.swiper-button-next'),
                    prevEl: content.querySelector('.swiper-button-prev'),
                },
                observer: true,
                observeParents: true,
            });
        }
    });
}
}


// DESTINATIONS: Kakao 지도 생성/연동
function initDestinationMaps() {
  const destinationHeader = document.querySelector('.destination-header');
  if (!destinationHeader) return; // destinations.html 이 아닐 때는 패스

  const tabs = destinationHeader.querySelectorAll('.tab-wrapper li');
  if (!tabs.length) return;
  if (typeof window.createDestinationMap !== 'function') return;

  // 초기 활성 탭(예: 죽도) 지도 생성
  const activeTab = destinationHeader.querySelector('.tab-wrapper li.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    const cfg = destinationInfoByTab[tabId];
    if (cfg) {
      window.createDestinationMap(cfg.selector, cfg.lat, cfg.lng, cfg.name);
    }
  }

  // 탭 전환 시 해당 탭 지도 생성/리프레시
  tabs.forEach(function (tab) {
    const tabId = tab.getAttribute('data-tab');
    const cfg = destinationInfoByTab[tabId];
    if (!cfg) return;

    tab.addEventListener('click', function () {
      // 공통 탭 UI(슬라이더/컨텐츠 전환) 동작 이후에 지도 처리
      setTimeout(function () {
        const mapsStore = window.destinationMaps || {};
        const existingMap = mapsStore[cfg.selector];

        if (!existingMap) {
          window.createDestinationMap(cfg.selector, cfg.lat, cfg.lng, cfg.name);
        } else if (existingMap.relayout) {
          const currentCenter = existingMap.getCenter();
          existingMap.relayout();
          existingMap.setCenter(
            currentCenter || new kakao.maps.LatLng(cfg.lat, cfg.lng),
          );
        }
      }, 150);
    });
  });
}






