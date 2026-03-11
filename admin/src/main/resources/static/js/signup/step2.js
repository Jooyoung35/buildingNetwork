// 이메일 중복확인 및 인증 관련 변수
let emailChecked = false;
let emailVerified = false;
let verificationTimer = null;
let timeLeft = 600; // 10분 = 600초

// 인증번호 발송
function sendVerificationCode() {
    const email = document.getElementById('email').value.trim();
    const sendBtn = document.getElementById('sendCodeBtn');
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const resultDiv = document.getElementById('verificationResult');
    const timerDiv = document.getElementById('verificationTimer');
    const codeInput = document.getElementById('verificationCode');
    
    if (!email) {
        alert('이메일을 먼저 입력해주세요.');
        return;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('올바른 이메일 형식을 입력해주세요.');
        return;
    }
    
    // 중복확인 체크
    if (!emailChecked) {
        alert('이메일 중복확인을 먼저 해주세요.');
        return;
    }
    
    // 버튼 비활성화
    sendBtn.disabled = true;
    sendBtn.textContent = '발송 중...';
    
    // AJAX 요청
    fetch('/api/send-verification-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            resultDiv.style.display = 'block';
            resultDiv.className = 'help-text verification-success';
            resultDiv.textContent = data.message;
            
            // 인증번호 입력 필드 활성화
            codeInput.disabled = false;
            codeInput.value = '';
            
            // 버튼 전환
            sendBtn.style.display = 'none';
            verifyBtn.style.display = 'inline-block';
            
            // 타이머 시작
            timeLeft = 600;
            startTimer();
        } else {
            resultDiv.style.display = 'block';
            resultDiv.className = 'help-text verification-error';
            resultDiv.textContent = data.message;
            sendBtn.disabled = false;
            sendBtn.textContent = '인증번호 발송';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.style.display = 'block';
        resultDiv.className = 'help-text verification-error';
        resultDiv.textContent = '인증번호 발송 중 오류가 발생했습니다.';
        sendBtn.disabled = false;
        sendBtn.textContent = '인증번호 발송';
    });
}

// 인증번호 확인
function verifyCode() {
    const email = document.getElementById('email').value.trim();
    const code = document.getElementById('verificationCode').value.trim();
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const resultDiv = document.getElementById('verificationResult');
    const timerDiv = document.getElementById('verificationTimer');
    
    if (!code) {
        alert('인증번호를 입력해주세요.');
        return;
    }
    
    if (code.length !== 6) {
        alert('인증번호는 6자리입니다.');
        return;
    }
    
    // 버튼 비활성화
    verifyBtn.disabled = true;
    verifyBtn.textContent = '확인 중...';
    
    // AJAX 요청
    fetch('/api/verify-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            resultDiv.style.display = 'block';
            resultDiv.className = 'help-text verification-success';
            resultDiv.textContent = data.message;
            
            // 인증 완료 처리
            emailVerified = true;
            document.getElementById('verificationCode').disabled = true;
            verifyBtn.disabled = true;
            verifyBtn.textContent = '인증완료';
            
            // 타이머 정지
            if (verificationTimer) {
                clearInterval(verificationTimer);
                verificationTimer = null;
            }
            timerDiv.style.display = 'none';
        } else {
            resultDiv.style.display = 'block';
            resultDiv.className = 'help-text verification-error';
            resultDiv.textContent = data.message;
            verifyBtn.disabled = false;
            verifyBtn.textContent = '인증번호 확인';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.style.display = 'block';
        resultDiv.className = 'help-text verification-error';
        resultDiv.textContent = '인증번호 확인 중 오류가 발생했습니다.';
        verifyBtn.disabled = false;
        verifyBtn.textContent = '인증번호 확인';
    });
}

// 타이머 시작
function startTimer() {
    const timerDiv = document.getElementById('verificationTimer');
    timerDiv.style.display = 'block';
    
    if (verificationTimer) {
        clearInterval(verificationTimer);
    }
    
    verificationTimer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDiv.textContent = `인증번호 유효시간: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(verificationTimer);
            verificationTimer = null;
            timerDiv.textContent = '인증번호가 만료되었습니다. 다시 발송해주세요.';
            timerDiv.className = 'help-text verification-error';
            emailVerified = false;
            document.getElementById('verificationCode').disabled = true;
            document.getElementById('sendCodeBtn').style.display = 'inline-block';
            document.getElementById('sendCodeBtn').disabled = false;
            document.getElementById('sendCodeBtn').textContent = '인증번호 발송';
            document.getElementById('verifyCodeBtn').style.display = 'none';
        }
    }, 1000);
}

// 이메일 중복확인
function checkEmailDuplicate() {
    const email = document.getElementById('email').value.trim();
    const resultDiv = document.getElementById('emailCheckResult');
    const emailInput = document.getElementById('email');
    const checkButton = document.querySelector('button[onclick="checkEmailDuplicate()"]');
    
    if (!email) {
        alert('이메일을 입력해주세요.');
        return;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        resultDiv.style.display = 'block';
        resultDiv.className = 'error-message';
        resultDiv.textContent = '올바른 이메일 형식을 입력해주세요.';
        emailInput.classList.add('error');
        emailChecked = false;
        return;
    }
    
    // 버튼 비활성화
    checkButton.disabled = true;
    checkButton.textContent = '확인 중...';
    
    // AJAX 요청
    fetch(`/api/check-email?email=${encodeURIComponent(email)}`)
        .then(response => response.json())
        .then(data => {
            resultDiv.style.display = 'block';
            emailInput.classList.remove('error');
            
            if (data.exists) {
                resultDiv.className = 'error-message';
                resultDiv.textContent = data.message;
                emailInput.classList.add('error');
                emailChecked = false;
            } else {
                resultDiv.className = 'help-text';
                resultDiv.style.color = '#28a745';
                resultDiv.textContent = data.message;
                emailChecked = true;
            }
            
            checkButton.disabled = false;
            checkButton.textContent = '중복확인';
        })
        .catch(error => {
            console.error('Error:', error);
            resultDiv.style.display = 'block';
            resultDiv.className = 'error-message';
            resultDiv.textContent = '중복확인 중 오류가 발생했습니다.';
            emailInput.classList.add('error');
            emailChecked = false;
            checkButton.disabled = false;
            checkButton.textContent = '중복확인';
        });
}

// 이메일 변경 시 중복확인 및 인증 초기화
document.getElementById('email').addEventListener('input', function() {
    if (emailChecked) {
        emailChecked = false;
        const resultDiv = document.getElementById('emailCheckResult');
        resultDiv.style.display = 'none';
        this.classList.remove('error');
    }
    
    // 이메일 변경 시 인증 상태 초기화
    if (emailVerified) {
        emailVerified = false;
        const sendBtn = document.getElementById('sendCodeBtn');
        const verifyBtn = document.getElementById('verifyCodeBtn');
        const resultDiv = document.getElementById('verificationResult');
        const timerDiv = document.getElementById('verificationTimer');
        const codeInput = document.getElementById('verificationCode');
        
        sendBtn.style.display = 'inline-block';
        sendBtn.disabled = false;
        sendBtn.textContent = '인증번호 발송';
        verifyBtn.style.display = 'none';
        resultDiv.style.display = 'none';
        timerDiv.style.display = 'none';
        codeInput.value = '';
        codeInput.disabled = false;
        
        if (verificationTimer) {
            clearInterval(verificationTimer);
            verificationTimer = null;
        }
    }
});

// 비밀번호 일치 확인
function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const errorDiv = document.getElementById('passwordMatchError');
    
    if (passwordConfirm && password !== passwordConfirm) {
        errorDiv.style.display = 'block';
        document.getElementById('passwordConfirm').classList.add('error');
    } else {
        errorDiv.style.display = 'none';
        document.getElementById('passwordConfirm').classList.remove('error');
    }
}

// 전화번호 자동 포맷팅
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 3 && value.length <= 7) {
        value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 7) {
        value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
    e.target.value = value;
});

// 폼 제출 전 검증
document.querySelector('form').addEventListener('submit', function(e) {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const companyId = document.getElementById('companyId').value;
    const agreeUniqueInfo = document.getElementById('agreeUniqueInfo').checked;
    const companyError = document.getElementById('companyError');
    
    // 이메일 중복확인 체크
    if (!emailChecked) {
        e.preventDefault();
        alert('이메일 중복확인을 해주세요.');
        return false;
    }
    
    // 이메일 인증 체크
    if (!emailVerified) {
        e.preventDefault();
        alert('이메일 인증을 완료해주세요.');
        return false;
    }
    
    if (password !== passwordConfirm) {
        e.preventDefault();
        alert('비밀번호가 일치하지 않습니다.');
        return false;
    }
    
    // 빌딩 선택 체크
    const buildingId = document.getElementById('buildingId').value;
    const buildingError = document.getElementById('buildingError');
    if (!buildingId || buildingId === '') {
        e.preventDefault();
        buildingError.style.display = 'block';
        document.getElementById('buildingId').classList.add('error');
        alert('빌딩을 선택해주세요.');
        return false;
    }
    
    // 회사 선택 체크
    if (!companyId || companyId === '') {
        e.preventDefault();
        companyError.style.display = 'block';
        document.getElementById('companyId').classList.add('error');
        alert('회사를 선택해주세요.');
        return false;
    } else {
        companyError.style.display = 'none';
        document.getElementById('companyId').classList.remove('error');
    }
    
    if (!agreeUniqueInfo) {
        e.preventDefault();
        alert('고유식별정보 수집 및 이용에 동의해주세요.');
        return false;
    }
});

// 빌딩 선택 시 회사 목록 로드
const buildingSelect = document.getElementById('buildingId');
const companySelect = document.getElementById('companyId');
const buildingError = document.getElementById('buildingError');
const companyError = document.getElementById('companyError');

buildingSelect.addEventListener('change', async function() {
    const buildingId = this.value;
    
    // 빌딩 선택 검증
    if (!buildingId) {
        buildingError.style.display = 'block';
        this.classList.add('error');
        companySelect.innerHTML = '<option value="">먼저 빌딩을 선택하세요</option>';
        companySelect.disabled = true;
        companySelect.value = '';
        return;
    }
    
    buildingError.style.display = 'none';
    this.classList.remove('error');
    
    // 회사 목록 로드
    try {
        companySelect.disabled = true;
        companySelect.innerHTML = '<option value="">로딩 중...</option>';
        
        const response = await fetch(`/api/companies/by-building?buildingId=${buildingId}`);
        const companies = await response.json();
        
        companySelect.innerHTML = '<option value="">회사를 선택하세요</option>';
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = company.name + ' (' + company.code + ')';
            companySelect.appendChild(option);
        });
        
        companySelect.disabled = false;
        companyError.style.display = 'none';
    } catch (error) {
        console.error('Error loading companies:', error);
        companySelect.innerHTML = '<option value="">회사 목록을 불러올 수 없습니다</option>';
        companySelect.disabled = true;
    }
});

// 회사 선택 시 에러 메시지 숨기기
companySelect.addEventListener('change', function() {
    if (companyError && this.value) {
        companyError.style.display = 'none';
        this.classList.remove('error');
    }
});
