// 쿠키 관련 함수들
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
}

function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
}

// 페이지 로드 시 저장된 이메일 불러오기
window.addEventListener('DOMContentLoaded', function() {
    const savedEmail = getCookie('savedEmail');
    const rememberMeChecked = getCookie('rememberMe') === 'true';
    
    if (savedEmail) {
        document.getElementById('email').value = savedEmail;
    }
    
    if (rememberMeChecked) {
        document.getElementById('remember-me').checked = true;
    }
});

// 폼 제출 시 아이디 저장 처리
document.getElementById('loginForm').addEventListener('submit', function(e) {
    const email = document.getElementById('email').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    if (rememberMe) {
        // 체크되어 있으면 이메일과 체크박스 상태 저장 (30일)
        setCookie('savedEmail', email, 30);
        setCookie('rememberMe', 'true', 30);
    } else {
        // 체크 해제되어 있으면 쿠키 삭제
        deleteCookie('savedEmail');
        deleteCookie('rememberMe');
    }
});
