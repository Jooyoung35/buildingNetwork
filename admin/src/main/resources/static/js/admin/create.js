// 이메일 중복확인
let emailChecked = false;
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

// 이메일 변경 시 중복확인 초기화
document.getElementById('email').addEventListener('input', function() {
    if (emailChecked) {
        emailChecked = false;
        const resultDiv = document.getElementById('emailCheckResult');
        resultDiv.style.display = 'none';
        this.classList.remove('error');
    }
});

// 빌딩 선택 시 회사 목록 로드 (최고 관리자만)
const isManager = /*[[${isManager}]]*/ false;
if (!isManager) {
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
            
            const response = await fetch(`/admin/company/list/by-building/${buildingId}`);
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
}

// 폼 제출 전 검증
document.querySelector('form').addEventListener('submit', function(e) {
    const email = document.getElementById('email').value.trim();
    const companyId = document.getElementById('companyId').value;
    const companyError = document.getElementById('companyError');
    const buildingError = document.getElementById('buildingError');
    
    // 이메일 중복확인 체크
    if (!emailChecked) {
        e.preventDefault();
        alert('이메일 중복확인을 해주세요.');
        return false;
    }
    
    // 빌딩/회사 선택 체크 (최고 관리자인 경우에만)
    if (!isManager) {
        const buildingId = document.getElementById('buildingId').value;
        if (!buildingId || buildingId === '') {
            e.preventDefault();
            buildingError.style.display = 'block';
            document.getElementById('buildingId').classList.add('error');
            alert('빌딩을 선택해주세요.');
            return false;
        }
        if (!companyId || companyId === '') {
            e.preventDefault();
            companyError.style.display = 'block';
            document.getElementById('companyId').classList.add('error');
            alert('회사를 선택해주세요.');
            return false;
        }
    }
    // 일반 관리자의 경우 빌딩과 회사는 자동으로 설정되므로 검증 불필요
});
