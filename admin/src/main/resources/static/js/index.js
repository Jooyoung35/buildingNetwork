
// intro screen
window.addEventListener('load', () => {
  const intro = document.getElementById('intro-screen');
  
  // 2초 정도 보여준 후 사라지게 하고 싶을 때
  setTimeout(() => {
    intro.style.opacity = '0';
    
    // 애니메이션이 끝난 후 요소를 완전히 제거 (클릭 방해 방지)
    setTimeout(() => {
      intro.style.display = 'none';
    }, 1000); 
  }, 1500);
});


// rest 부분 모바일 버전일때 1개씩 표출
const swiperRest = document.querySelector('.swiper-rest');
if (swiperRest) {
  Object.assign(swiperRest, {
    slidesPerView: 1,           // 기본(모바일): 1개
    breakpoints: {
      768: {                    // 768px 이상: 2개
        slidesPerView: 2,
        spaceBetween: 20,
      },
    },
  });
  swiperRest.initialize();
}

    //brand intro : 전체 나타나기 효과
    // const ani2 = gsap.timeline();
    // ani2.from(".brand-txt", {x: -150, autoAlpha:0}) //왼쪽 -200px, opacity 0 시작 > 점점 나타나게
    //     .from(".brand-img", {x: 100, autoAlpha:0}) 

    // ScrollTrigger.create({
    //     animation: ani2,
    //     trigger: ".brand-story", //brand-intro가 화면에 들어오면 애니메이션 작동
    //     start: "top 80%", //시작점 
    //     end: "+=400",
    //     scrub: 1,
    //     pin: false,
    //     anticipatePin: 1,
    //     markers: false,
    // });

    const mm = gsap.matchMedia();

    // 1280px 이상일 때만 실행
    mm.add("(min-width: 768px)", () => {
        const ani2 = gsap.timeline();
        ani2.from(".brand-txt", {x: -150, autoAlpha:0})
            .from(".brand-img", {x: 100, autoAlpha:0});

        ScrollTrigger.create({
            animation: ani2,
            trigger: ".brand-story",
            start: "top 80%",
            end: "+=400",
            scrub: 1,
            pin: false,
            anticipatePin: 1,
            markers: false,
        });

        
		//rest-bnr : 전체 나타나기 효과
    const ani3 = gsap.timeline();
    ani3.from(".rest-bnr", {x: -150, autoAlpha:0}) //왼쪽 -200px, opacity 0 시작 > 점점 나타나게

    ScrollTrigger.create({
        animation: ani3,
        trigger: ".rest", 
        start: "top 80%", 
        end: "+=400",
        scrub: 1,
        pin: false,
        anticipatePin: 1,
        markers: false,
    });

    // 전체 나타나기 효과
    function createScrollAnimation(sectionSelector, contentSelector) {
    	const show1 = gsap.timeline();
    	show1
				.from(`${sectionSelector} .title`, { y: 150, autoAlpha: 0 })
        .from(`${sectionSelector} ${contentSelector}`, { y: 150, autoAlpha: 0 });

			ScrollTrigger.create({
					animation: show1,
					trigger: sectionSelector,
					start: "top 80%",
					end: "+=400",
					scrub: 1,
					pin: false,
					anticipatePin: 1,
					markers: false,
			});
    }

    createScrollAnimation(".our-building", ".buildings");
		createScrollAnimation(".membership", ".benefits");
		createScrollAnimation(".rest-contents", ".swiper-rest");



    });


// [3] 페이지 로드 시 실행
window.addEventListener('DOMContentLoaded', () => {
		gsap.registerPlugin(ScrollTrigger);
    initSwiperRest();
    includeHTML(initCommonDesign);
});
