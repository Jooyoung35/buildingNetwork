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
        $('.tab-content').removeClass('active');
        $('#' + tabId).addClass('active');
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
    includeHTML(() => {
        initCommonDesign();
        // ui.js에 있는 함수 호출
        if (typeof initPageUI === 'function') initPageUI(); 
    }
);
});
