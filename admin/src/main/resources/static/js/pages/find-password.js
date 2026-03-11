let emailVerified = false;
let verificationTimer = null;
let timeLeft = 600; // 10분 = 600초

// 인증번호 발송
function sendVerificationCode() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const sendBtn = document.getElementById('sendCodeBtn');
    const resultDiv = document.getElementById('emailResult');
    const verificationSection = document.getElementById('verificationSection');
    const codeInput = document.getElementById('verificationCode');
    
    if (!name) {
        alert('이름을 입력해주세요.');
        return;
    }
    
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
        return;
    }
    
    // 버튼 비활성화
    sendBtn.disabled = true;
    sendBtn.textContent = '발송 중...';
    
    // AJAX 요청
    fetch('/api/find-password/send-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            resultDiv.style.display = 'block';
            resultDiv.className = 'success-message';
            resultDiv.textContent = data.message;
            
            // 인증번호 입력 필드 활성화
            codeInput.disabled = false;
            codeInput.value = '';
            verificationSection.classList.remove('hidden');
            
            // 타이머 시작
            timeLeft = 600;
            startTimer();
        } else {
            resultDiv.style.display = 'block';
            resultDiv.className = 'error-message';
            resultDiv.textContent = data.message;
            sendBtn.disabled = false;
            sendBtn.textContent = '인증번호 발송';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.style.display = 'block';
        resultDiv.className = 'error-message';
        resultDiv.textContent = '인증번호 발송 중 오류가 발생했습니다.';
        sendBtn.disabled = false;
        sendBtn.textContent = '인증번호 발송';
    });
}

// 인증번호 확인
function verifyCode() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const code = document.getElementById('verificationCode').value.trim();
    const verifyBtn = document.getElementById('verifyCodeBtn');
    const resultDiv = document.getElementById('verificationResult');
    const passwordResetSection = document.getElementById('passwordResetSection');
    
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
    fetch('/api/find-password/verify-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            resultDiv.style.display = 'block';
            resultDiv.className = 'success-message';
            resultDiv.textContent = data.message;
            
            // 인증 완료 처리
            emailVerified = true;
            document.getElementById('verificationCode').disabled = true;
            verifyBtn.disabled = true;
            verifyBtn.textContent = '인증완료';
            
            // 비밀번호 재설정 섹션 표시
            passwordResetSection.classList.remove('hidden');
            document.getElementById('newPassword').disabled = false;
            document.getElementById('newPasswordConfirm').disabled = false;
            document.getElementById('resetPasswordBtn').disabled = false;
            
            // 타이머 정지
            if (verificationTimer) {
                clearInterval(verificationTimer);
                verificationTimer = null;
            }
            document.getElementById('verificationTimer').style.display = 'none';
        } else {
            resultDiv.style.display = 'block';
            resultDiv.className = 'error-message';
            resultDiv.textContent = data.message;
            verifyBtn.disabled = false;
            verifyBtn.textContent = '인증번호 확인';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.style.display = 'block';
        resultDiv.className = 'error-message';
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
            emailVerified = false;
            document.getElementById('verificationCode').disabled = true;
            document.getElementById('sendCodeBtn').disabled = false;
            document.getElementById('sendCodeBtn').textContent = '인증번호 발송';
        }
    }, 1000);
}

// 비밀번호 일치 확인
function checkPasswordMatch() {
    const password = document.getElementById('newPassword').value;
    const passwordConfirm = document.getElementById('newPasswordConfirm').value;
    const errorDiv = document.getElementById('passwordMatchError');
    
    if (passwordConfirm && password !== passwordConfirm) {
        errorDiv.style.display = 'block';
        document.getElementById('newPasswordConfirm').classList.add('error');
    } else {
        errorDiv.style.display = 'none';
        document.getElementById('newPasswordConfirm').classList.remove('error');
    }
}

// 비밀번호 재설정
function resetPassword() {
    if (!emailVerified) {
        alert('이메일 인증을 완료해주세요.');
        return;
    }
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const newPasswordConfirm = document.getElementById('newPasswordConfirm').value;
    const resetBtn = document.getElementById('resetPasswordBtn');
    
    if (!newPassword) {
        alert('새 비밀번호를 입력해주세요.');
        return;
    }
    
    if (newPassword.length < 8) {
        alert('비밀번호는 8자 이상이어야 합니다.');
        return;
    }
    
    if (newPassword !== newPasswordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    // 버튼 비활성화
    resetBtn.disabled = true;
    resetBtn.textContent = '재설정 중...';
    
    // AJAX 요청
    fetch('/api/find-password/reset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(newPassword)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 결과 표시
            document.getElementById('findPasswordForm').style.display = 'none';
            document.getElementById('resultSection').classList.add('show');
        } else {
            alert(data.message);
            resetBtn.disabled = false;
            resetBtn.textContent = '비밀번호 재설정';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('비밀번호 재설정 중 오류가 발생했습니다.');
        resetBtn.disabled = false;
        resetBtn.textContent = '비밀번호 재설정';
    });
}

// 이름 또는 이메일 변경 시 인증 상태 초기화
function resetVerificationState() {
    if (emailVerified) {
        emailVerified = false;
        document.getElementById('verificationSection').classList.add('hidden');
        document.getElementById('passwordResetSection').classList.add('hidden');
        document.getElementById('verificationCode').value = '';
        document.getElementById('verificationCode').disabled = true;
        document.getElementById('newPassword').value = '';
        document.getElementById('newPassword').disabled = true;
        document.getElementById('newPasswordConfirm').value = '';
        document.getElementById('newPasswordConfirm').disabled = true;
        document.getElementById('sendCodeBtn').disabled = false;
        document.getElementById('sendCodeBtn').textContent = '인증번호 발송';
        document.getElementById('verifyCodeBtn').disabled = false;
        document.getElementById('verifyCodeBtn').textContent = '인증번호 확인';
        document.getElementById('resetPasswordBtn').disabled = true;
        document.getElementById('verificationResult').style.display = 'none';
        document.getElementById('verificationTimer').style.display = 'none';
        
        if (verificationTimer) {
            clearInterval(verificationTimer);
            verificationTimer = null;
        }
    }
}

document.getElementById('name').addEventListener('input', resetVerificationState);
document.getElementById('email').addEventListener('input', resetVerificationState);
