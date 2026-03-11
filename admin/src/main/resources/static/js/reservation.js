// reservation.js

// Swiper 전역 설정
var swiper = new Swiper(".mySwiper", {
    pagination: {
        el: ".swiper-pagination",
    },
});

let checkin = null;
let checkout = null;
let calendar1;
let calendar2;

function createCalendar(el, monthOffset) {
    const calendar = new FullCalendar.Calendar(el, {
        initialView: 'dayGridMonth',
        locale: 'ko',
        height: 'auto',
        fixedWeekCount: true,
        handleWindowResize: true,
        initialDate: new Date(2026, 2 + monthOffset, 1),
        headerToolbar: {
            left: 'prev',
            center: 'title',
            right: 'next'
        },
        datesSet: function(info) {
            if (el.id === "calendar1" && calendar2) {
                const currentDate = calendar1.getDate();
                const nextMonth = new Date(currentDate);
                nextMonth.setMonth(currentDate.getMonth() + 1);
                nextMonth.setDate(1);
                calendar2.gotoDate(nextMonth);
            }
        },
        dayCellContent: function(arg) {
            return arg.date.getDate();
        },
        dateClick: function(info) {
            const clicked = new Date(info.dateStr);
            if (!checkin || (checkin && checkout)) {
        // 첫 선택 혹은 새로 시작
        checkin = clicked;
        checkout = null;
        document.getElementById("checkin").value = info.dateStr;
        document.getElementById("checkout").value = "";
    } else {
        // 체크아웃 선택
        if (clicked <= checkin) {
            checkin = clicked;
            document.getElementById("checkin").value = info.dateStr;
        } else {
            checkout = clicked;
            document.getElementById("checkout").value = info.dateStr;
        }
    }
            highlightDates();
            updateSidebarDate();
        },
        events: [
            { start: '2026-03-06', title: '3' },
            { start: '2026-03-07', title: '3' },
            { start: '2026-03-08', title: '3' },
            { start: '2026-03-09', title: '3' },
            { start: '2026-03-10', title: '3' }
        ],
        eventContent: function(arg) {
            return {
                html: `<div class="room-count">${arg.event.title}</div>`
            }
        }
    });
    calendar.render();
    return calendar;
}
function updateSidebarDate() {
    const $dateDisplay = $('.reservation-sidebar dt:contains("체크인/체크아웃")').next('dd');
    
    if (checkin && checkout) {
        const nights = getDiffNights(checkin, checkout);
        const days = nights + 1;
        const dateStr = `${formatDate(checkin)} - ${formatDate(checkout)} (${nights}박 ${days}일)`;
        $dateDisplay.text(dateStr);
    } else if (checkin) {
        $dateDisplay.text(`${formatDate(checkin)} - 날짜 선택 중`);
    } else {
        $dateDisplay.text("날짜를 선택해 주세요");
    }
}


function highlightDates() {
    document.querySelectorAll('.fc-daygrid-day').forEach(day => {
        day.classList.remove('fc-day-selected', 'fc-day-range');
    });
    if (!checkin) return;
    const days = document.querySelectorAll('.fc-daygrid-day');
    days.forEach(day => {
        const date = new Date(day.getAttribute("data-date"));
        if (date.getTime() === checkin.getTime()) {
            day.classList.add("fc-day-selected");
        }
        if (checkout) {
            if (date > checkin && date < checkout) {
                day.classList.add("fc-day-range");
            }
            if (date.getTime() === checkout.getTime()) {
                day.classList.add("fc-day-selected");
            }
        }
    });
}

// 날짜를 YYYY.MM.DD 형식으로 변환하는 함수
function formatDate(date) {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// 박수(Night) 계산 함수
function getDiffNights(start, end) {
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

document.addEventListener('DOMContentLoaded', function() {
    calendar1 = createCalendar(document.getElementById("calendar1"), 0);
    calendar2 = createCalendar(document.getElementById("calendar2"), 1);

    function openModal() {
        $('#room-modal').fadeIn(300).css('display', 'flex');
        $('html, body').addClass('stop-scroll');
        if (typeof swiper !== 'undefined') {
            setTimeout(function() {
                swiper.update();
            }, 310);
        }
    }

    function closeModal() {
        $('#room-modal').fadeOut(300);
        $('html, body').removeClass('stop-scroll');
    }

    $('.view-detail-btn').on('click', function() {
        openModal();
    });

    $('.close-modal').on('click', function() {
        closeModal();
    });

    $(window).on('click', function(event) {
        if ($(event.target).is('#room-modal')) {
            closeModal();
        }
    });

    $('.room-select-btn').on('click', function() {
        $('.room-select-btn').removeClass('active');
        $(this).addClass('active');
        const roomId = $(this).data('id');
        // 사이드바 객실 정보 업데이트 (선택자 주의)
        $('.reservation-sidebar .info-item').each(function() {
            if ($(this).find('.label-text').text() === '객실') {
                $(this).find('.basic-desc').text(roomId + '동');
            }
        });
    });

    // 공통 레이아웃 로드 후 실행될 콜백 (기존 코드 유지)
    if (typeof includeHTML === 'function') {
        includeHTML(initCommonDesign);
    }
});