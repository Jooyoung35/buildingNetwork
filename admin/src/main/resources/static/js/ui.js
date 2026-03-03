
let tabSwipers ={};

// ui.js에서 실행될 메인 함수
function initPageUI() {
    initBuildingTabs();
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
    





