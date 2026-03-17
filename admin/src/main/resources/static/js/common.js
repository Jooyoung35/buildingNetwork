// [1] HTML 인클루드 함수
function includeHTML(callback) {
    const elements = document.querySelectorAll('[data-include]');
    let count = 0;
    if (elements.length === 0) {
        if (callback) callback();
        return;
    }

    elements.forEach(el => {
        const file = el.getAttribute('data-include');
        fetch(file)
            .then(res => res.text())
            .then(data => {
                el.innerHTML = data;
                count++;
                if (count === elements.length && callback) callback();
            });
    });
}

// [2] 전역 공통 디자인 함수
function initCommonDesign() {
    // GNB 관련
    $(".gnb").mouseenter(function(){
        $("#header").addClass("gnb-open");
        $(".wrap-gnb").stop().animate({"height":"350px"},300);
        $(".gnb > li > .sub").stop().animate({"height":"220px"},600);
    }).mouseleave(function(){
        $("#header").removeClass("gnb-open");
        $(".wrap-gnb").stop().animate({"height":"0px"},500);
        $(".gnb > li > .sub").stop().animate({"height":"0px"},200);
    });

    $(window).scroll(function() {
        const isScrolled = $(this).scrollTop() > 50;
        $('#header, .mo-main-page-header').toggleClass('scrolled', isScrolled);
    });

    $('.gnb li').on('mouseenter', function() {
        const target = $(this);
        $('.nav-indicator').css({
            'left': target.position().left + (target.width() / 2) + 'px',
            'opacity': 1
        });
    });

    // 모바일 GNB
    $(".mo-gnb-btn img").click(function () {
        $(".mo-header, .wrap-mo-gnb, .mo-top-area").toggleClass("active"); 
        $(".menu-ico, .close-ico").toggle(); 
        $("body").toggleClass("no-scroll");
    });
    
    // 모바일 GNB 내 탭 메뉴
    $('.mo-main-menu li').click(function() {
        $('.mo-main-menu li').removeClass('active');
        $(this).addClass('active');
        const tabId = $(this).attr('data-tab');

        $('.mo-sub-content .tab-content').removeClass('active');
        $('.mo-sub-content #' + tabId).addClass('active');
    });


// 모바일 서브메뉴 기억하기----------
    // const currentPath = window.location.pathname;
    // $('.mo-sub-content .tab-content li a').each(function() {
    //     const linkHref = $(this).attr('href');
        
    //     if (linkHref !== '/' && currentPath.includes(linkHref)) {
    //         const activeTabId = $(this).closest('.tab-content').attr('id');

    //         $('.mo-main-menu li').removeClass('active');
    //         $('.mo-sub-content .tab-content').removeClass('active');

    //         $(`.mo-main-menu li[data-tab="${activeTabId}"]`).addClass('active');
            
    //         $('#' + activeTabId).addClass('active');

    //         return false; 
    //     }
    // });


    // 모바일 서브메뉴 기억하기
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search; // ?tab=... 부분 포함
    const fullPath = currentPath + currentSearch;

    // 1. 범위를 '.mo-sub-content' 내부로 엄격하게 제한합니다.
    // 2. 본문의 .tab-content와 섞이지 않도록 $(this).closest를 사용합니다.
    $('.mo-sub-content .tab-content li a').each(function() {
        const linkHref = $(this).attr('href');
        
        if (linkHref && linkHref !== '#' && linkHref !== '/') {
            // 현재 경로가 링크 주소를 포함하고 있는지 확인
            // (파일명이 포함되어 있는지 혹은 전체 경로가 일치하는지)
            if (currentPath.includes(linkHref) || fullPath.includes(linkHref)) {
                
                // 본문의 요소가 아닌, 반드시 '.mo-sub-content' 내부의 부모를 찾음
                const $parentTab = $(this).closest('.mo-sub-content .tab-content');
                const activeTabId = $parentTab.attr('id');

                if (activeTabId) {
                    // 초기화 (GNB 내부 요소만)
                    $('.mo-main-menu li').removeClass('active');
                    $('.mo-sub-content .tab-content').removeClass('active');

                    // 활성화
                    $(`.mo-main-menu li[data-tab="${activeTabId}"]`).addClass('active');
                    $parentTab.addClass('active');

                    return false; // 매칭 성공 시 종료
                }
            }
        }
    });

    
    // 푸터 & 유틸
    $(".site-con").hover(
        function() { $(".site-con ul").stop().slideDown(500); },
        function() { $(".site-con ul").stop().slideUp(500); }
    );

    $('.top-ban-btn').click(function(){ $('.top-ban').stop().slideUp(500); });
    $(".top-btn").click(function(){ $('html, body').stop().animate({scrollTop : 0}, 500); });

    window.addEventListener('scroll', () => {
        const topBtn = document.querySelector('.top-btn');
        if(topBtn) topBtn.style.display = window.scrollY > 250 ? 'block' : 'none';
    });

    $(window).resize(function() {
        if (window.matchMedia("(min-width: 1280px)").matches) {
            $("body").removeClass("no-scroll");
            $(".wrap-mo-gnb, .mo-top-area").removeClass("active");
            $(".close-ico").hide();
            $(".menu-ico").show();
        }
    });
}

// 실행부
document.addEventListener("DOMContentLoaded", () => {
    // includeHTML 없이 바로 공통 UI만 초기화
    initCommonDesign();
    if (typeof initPageUI === 'function') initPageUI(); 
});
