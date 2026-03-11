// 빌딩 선택 시 회사 필터 초기화
document.addEventListener('DOMContentLoaded', function() {
    const buildingFilter = document.getElementById('buildingFilter');
    const companyFilter = document.getElementById('companyFilter');
    
    if (buildingFilter) {
        buildingFilter.addEventListener('change', function() {
            // 빌딩 선택 시 회사 필터 초기화
            if (companyFilter) {
                companyFilter.value = '';
            }
        });
    }
});

// 빌딩 등록 관련 함수
function openBuildingModal() {
    document.getElementById('buildingModal').style.display = 'flex';
    document.getElementById('buildingForm').reset();
    document.getElementById('buildingError').style.display = 'none';
}

function closeBuildingModal() {
    document.getElementById('buildingModal').style.display = 'none';
}

async function saveBuilding() {
    const name = document.getElementById('buildingName').value.trim();
    const errorDiv = document.getElementById('buildingError');
    
    if (!name) {
        errorDiv.textContent = '빌딩이름을 입력해주세요.';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/admin/building/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('빌딩이 성공적으로 등록되었습니다.');
            closeBuildingModal();
            location.reload();
        } else {
            errorDiv.textContent = data.message;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = '빌딩 등록 중 오류가 발생했습니다.';
        errorDiv.style.display = 'block';
    }
}

// 회사 등록 관련 함수
async function openCompanyModal() {
    // 빌딩 목록 로드
    try {
        const response = await fetch('/admin/building/list');
        const buildings = await response.json();
        
        const buildingSelect = document.getElementById('buildingSelect');
        buildingSelect.innerHTML = '<option value="">빌딩을 선택하세요</option>';
        
        buildings.forEach(building => {
            const option = document.createElement('option');
            option.value = building.id;
            option.textContent = building.name + ' (' + building.code + ')';
            buildingSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading buildings:', error);
    }
    
    document.getElementById('companyModal').style.display = 'flex';
    document.getElementById('companyForm').reset();
    document.getElementById('companyError').style.display = 'none';
}

function closeCompanyModal() {
    document.getElementById('companyModal').style.display = 'none';
}

async function saveCompany() {
    const name = document.getElementById('companyName').value.trim();
    const buildingId = document.getElementById('buildingSelect').value;
    const errorDiv = document.getElementById('companyError');
    
    if (!buildingId) {
        errorDiv.textContent = '빌딩을 선택해주세요.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!name) {
        errorDiv.textContent = '회사이름을 입력해주세요.';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/admin/company/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                buildingId: parseInt(buildingId)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('회사가 성공적으로 등록되었습니다.');
            closeCompanyModal();
            location.reload();
        } else {
            errorDiv.textContent = data.message;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = '회사 등록 중 오류가 발생했습니다.';
        errorDiv.style.display = 'block';
    }
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const buildingModal = document.getElementById('buildingModal');
    const companyModal = document.getElementById('companyModal');
    if (event.target == buildingModal) {
        closeBuildingModal();
    }
    if (event.target == companyModal) {
        closeCompanyModal();
    }
}

// 테이블 정렬 함수
function sortTable(sortBy) {
    const url = new URL(window.location.href);
    const currentSortBy = url.searchParams.get('sortBy');
    const currentSortOrder = url.searchParams.get('sortOrder');
    
    // 같은 컬럼을 클릭하면 정렬 순서 변경, 다른 컬럼을 클릭하면 오름차순으로 시작
    let newSortOrder = 'asc';
    if (currentSortBy === sortBy && currentSortOrder === 'asc') {
        newSortOrder = 'desc';
    }
    
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('sortOrder', newSortOrder);
    url.searchParams.set('page', '1'); // 정렬 시 첫 페이지로 이동
    
    window.location.href = url.toString();
}

// 사용자 승인 함수
function approveUser(userId) {
    if (!confirm('이 사용자를 승인하시겠습니까?')) {
        return;
    }
    
    fetch('/admin/approve/' + userId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            location.reload(); // 페이지 새로고침
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('승인 처리 중 오류가 발생했습니다.');
    });
}

// 사용자 반려 함수
function rejectUser(userId) {
    if (!confirm('이 사용자를 반려하시겠습니까? (일반 사용자로 변경됩니다)')) {
        return;
    }
    
    fetch('/admin/reject/' + userId, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            location.reload(); // 페이지 새로고침
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('반려 처리 중 오류가 발생했습니다.');
    });
}

// 전체 선택/해제 함수
function toggleSelectAll(event) {
    const selectAllCheckbox = document.getElementById('selectAll');
    const selectAllMobileCheckbox = document.getElementById('selectAllMobile');
    
    // 어떤 체크박스가 클릭되었는지 확인
    let isChecked = false;
    if (event && event.target) {
        if (event.target.id === 'selectAll') {
            isChecked = event.target.checked;
        } else if (event.target.id === 'selectAllMobile') {
            isChecked = event.target.checked;
        }
    } else {
        // 이벤트가 없으면 첫 번째 체크박스 상태 확인
        isChecked = selectAllCheckbox ? selectAllCheckbox.checked : (selectAllMobileCheckbox ? selectAllMobileCheckbox.checked : false);
    }
    
    // 두 체크박스 동기화
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = isChecked;
    }
    if (selectAllMobileCheckbox) {
        selectAllMobileCheckbox.checked = isChecked;
    }
    
    // 모든 사용자 체크박스 선택/해제 (현재 페이지의 모든 체크박스)
    const userCheckboxes = document.querySelectorAll('.user-checkbox:not(#selectAll):not(#selectAllMobile)');
    userCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    
    // 전체 선택 체크박스 상태 업데이트
    updateSelectAllState();
}

// 개별 체크박스 상태에 따라 전체 선택 체크박스 업데이트
function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const selectAllMobileCheckbox = document.getElementById('selectAllMobile');
    // 전체 선택 체크박스는 제외하고 사용자 체크박스만 가져오기
    const userCheckboxes = document.querySelectorAll('.user-checkbox:not(#selectAll):not(#selectAllMobile)');
    const checkedCount = document.querySelectorAll('.user-checkbox:not(#selectAll):not(#selectAllMobile):checked').length;
    
    let checked = false;
    let indeterminate = false;
    
    if (userCheckboxes.length === 0) {
        checked = false;
        indeterminate = false;
    } else if (checkedCount === 0) {
        checked = false;
        indeterminate = false;
    } else if (checkedCount === userCheckboxes.length) {
        // 모든 체크박스가 체크된 경우에만 전체 선택 체크
        checked = true;
        indeterminate = false;
    } else {
        // 일부만 체크된 경우 완전히 해제 (indeterminate 사용 안 함)
        checked = false;
        indeterminate = false;
    }
    
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = checked;
        selectAllCheckbox.indeterminate = indeterminate;
    }
    if (selectAllMobileCheckbox) {
        selectAllMobileCheckbox.checked = checked;
        selectAllMobileCheckbox.indeterminate = indeterminate;
    }
}

// 페이지 로드 시 개별 체크박스에 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    const userCheckboxes = document.querySelectorAll('.user-checkbox:not(#selectAll):not(#selectAllMobile)');
    userCheckboxes.forEach(checkbox => {
        // onclick과 중복 방지를 위해 change 이벤트 사용
        checkbox.addEventListener('change', updateSelectAllState);
    });
    // 초기 상태 업데이트
    updateSelectAllState();
});

// 공통 PaginationUI 초기화
document.addEventListener('DOMContentLoaded', function () {
    const el = document.getElementById('pagination');
    if (!el || typeof PaginationUI === 'undefined') {
        return;
    }

    const options = {
        currentPage: Number(el.dataset.currentPage || '1'),
        totalPages: Number(el.dataset.totalPages || '0'),
        totalCount: Number(el.dataset.totalCount || '0'),
        size: Number(el.dataset.size || '10'),
        baseUrl: el.dataset.baseUrl || window.location.pathname,
        params: {
            size: el.dataset.size || '',
            searchType: el.dataset.searchType || '',
            searchKeyword: el.dataset.searchKeyword || '',
            buildingId: el.dataset.buildingId || '',
            companyId: el.dataset.companyId || '',
            roleFilter: el.dataset.roleFilter || '',
            gradeFilter: el.dataset.gradeFilter || '',
            sortBy: el.dataset.sortBy || '',
            sortOrder: el.dataset.sortOrder || ''
        }
    };

    const pagination = new PaginationUI(el, options);
    pagination.render();
});

// 선택된 회원 일괄 승인 함수
function approveSelectedUsers() {
    const checkedBoxes = document.querySelectorAll('.user-checkbox:not(#selectAll):not(#selectAllMobile):checked');
    
    if (checkedBoxes.length === 0) {
        alert('승인할 회원을 선택해주세요.');
        return;
    }
    
    if (!confirm('선택한 ' + checkedBoxes.length + '명의 회원을 승인하시겠습니까?')) {
        return;
    }
    
    const userIds = Array.from(checkedBoxes).map(checkbox => parseInt(checkbox.value));
    
    fetch('/admin/approve/batch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userIds)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            let message = data.message;
            if (data.skipped && data.skipped.length > 0) {
                message += '\n\n제외된 회원:\n' + data.skipped.join('\n');
            }
            if (data.errors && data.errors.length > 0) {
                message += '\n\n오류:\n' + data.errors.join('\n');
            }
            alert(message);
            location.reload();
        } else {
            let message = data.message;
            if (data.skipped && data.skipped.length > 0) {
                message += '\n\n제외된 회원:\n' + data.skipped.join('\n');
            }
            alert(message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('승인 처리 중 오류가 발생했습니다.');
    });
}

// 선택된 회원 일괄 반려 함수
function rejectSelectedUsers() {
    const checkedBoxes = document.querySelectorAll('.user-checkbox:not(#selectAll):not(#selectAllMobile):checked');
    
    if (checkedBoxes.length === 0) {
        alert('반려할 회원을 선택해주세요.');
        return;
    }
    
    if (!confirm('선택한 ' + checkedBoxes.length + '명의 회원을 반려하시겠습니까? (일반 사용자로 변경됩니다)')) {
        return;
    }
    
    const userIds = Array.from(checkedBoxes).map(checkbox => parseInt(checkbox.value));
    
    fetch('/admin/reject/batch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userIds)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            let message = data.message;
            if (data.skipped && data.skipped.length > 0) {
                message += '\n\n제외된 회원:\n' + data.skipped.join('\n');
            }
            if (data.errors && data.errors.length > 0) {
                message += '\n\n오류:\n' + data.errors.join('\n');
            }
            alert(message);
            location.reload();
        } else {
            let message = data.message;
            if (data.skipped && data.skipped.length > 0) {
                message += '\n\n제외된 회원:\n' + data.skipped.join('\n');
            }
            alert(message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('반려 처리 중 오류가 발생했습니다.');
    });
}
