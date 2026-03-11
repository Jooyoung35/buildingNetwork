function toggleAllAgreements() {
    const agreeAll = document.getElementById('agreeAll');
    const agreeRequired = document.getElementById('agreeRequired');
    const agreeOptional = document.getElementById('agreeOptional');
    
    agreeRequired.checked = agreeAll.checked;
    agreeOptional.checked = agreeAll.checked;
}

function checkRequired() {
    const agreeRequired = document.getElementById('agreeRequired');
    const agreeOptional = document.getElementById('agreeOptional');
    const agreeAll = document.getElementById('agreeAll');
    
    if (agreeRequired.checked && agreeOptional.checked) {
        agreeAll.checked = true;
    } else {
        agreeAll.checked = false;
    }
}

function toggleTerms(id) {
    const terms = document.getElementById(id);
    terms.classList.toggle('show');
}

document.getElementById('agreementForm').addEventListener('submit', function(e) {
    const agreeAll = document.getElementById('agreeAll');
    const agreeRequired = document.getElementById('agreeRequired');
    
    // 전체 동의 또는 필수 약관 동의 확인
    if (!agreeAll.checked && !agreeRequired.checked) {
        e.preventDefault();
        alert('필수 약관에 동의해주세요.');
        return false;
    }
});
