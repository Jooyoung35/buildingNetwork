// 빌딩 선택 시 회사 목록 로드 (일반 관리자가 아닌 경우에만)
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Profile] DOMContentLoaded 시작');
    
    const buildingSelect = document.getElementById('buildingId');
    const companySelect = document.getElementById('companyId');
    const buildingError = document.getElementById('buildingError');
    const companyError = document.getElementById('companyError');            
    
    console.log('[Profile] 요소 확인:', {
        buildingSelect: buildingSelect ? '존재' : '없음',
        companySelect: companySelect ? '존재' : '없음',
        buildingError: buildingError ? '존재' : '없음',
        companyError: companyError ? '존재' : '없음'
    });
    
    if (!buildingSelect || !companySelect) {
        console.log('[Profile] 필수 요소가 없어 종료');
        return;
    }
    
    // 현재 사용자의 빌딩 ID와 회사 ID
    const currentBuildingId = buildingSelect;
    const currentCompanyId = document.getElementById('currentCompanyId');
    
    console.log('[Profile] 현재 사용자 정보:', {
        currentBuildingId: currentBuildingId,                
        currentCompanyId: currentCompanyId,
        buildingSelectValue: buildingSelect.value
    });
    
    // 초기 로드 시 빌딩이 선택되어 있으면 회사 목록 로드
    if (currentBuildingId && buildingSelect.value) {
        console.log('[Profile] 빌딩이 선택되어 있음, 회사 목록 로드 시작');
        // 빌딩이 이미 선택되어 있으면 바로 회사 목록 로드
        loadCompaniesByBuilding(currentBuildingId.value, currentCompanyId.value);
    } else {
        console.log('[Profile] 빌딩이 선택되지 않음:', {
            currentBuildingId: currentBuildingId.value,
            buildingSelectValue: buildingSelect.value
        });
    }
    
    buildingSelect.addEventListener('change', async function() {
        const buildingId = this.value;
        console.log('[Profile] 빌딩 변경 이벤트:', buildingId);
        
        if (!buildingId || buildingId === '') {
            console.log('[Profile] 빌딩이 선택되지 않음, 회사 선택 비활성화');
            companySelect.innerHTML = '<option value="">먼저 빌딩을 선택하세요</option>';
            companySelect.disabled = true;
            companySelect.value = '';
            if (buildingError) {
                buildingError.style.display = 'block';
                this.classList.add('error');
            }
            return;
        }
        
        if (buildingError) {
            buildingError.style.display = 'none';
            this.classList.remove('error');
        }
        
        console.log('[Profile] 빌딩 변경으로 회사 목록 로드 시작');
        await loadCompaniesByBuilding(buildingId, null);
    });
    
    async function loadCompaniesByBuilding(buildingId, selectedCompanyId) {
        console.log('[Profile] loadCompaniesByBuilding 시작:', {
            buildingId: buildingId,
            selectedCompanyId: selectedCompanyId
        });
        
        if (!companySelect || !buildingId) {
            console.log('[Profile] loadCompaniesByBuilding 종료: 필수 파라미터 없음');
            return;
        }
        
        try {
            console.log('[Profile] 회사 목록 로딩 시작, 빌딩 ID:', buildingId);
            companySelect.disabled = true;
            companySelect.innerHTML = '<option value="">로딩 중...</option>';
            
            const response = await fetch(`/api/companies/by-building?buildingId=${buildingId}`);
            console.log('[Profile] API 응답 상태:', response.status, response.ok);
            
            if (!response.ok) {
                throw new Error('Failed to load companies');
            }
            
            const companies = await response.json();
            console.log('[Profile] 받은 회사 목록:', companies);
            
            // master 회사 제외
            const filteredCompanies = companies.filter(company => company.name !== 'master');
            console.log('[Profile] 필터링된 회사 목록 (master 제외):', filteredCompanies);
            
            companySelect.innerHTML = '<option value="">회사를 선택하세요</option>';
            
            // selectedCompanyId를 문자열로 변환하여 비교
            const targetCompanyIdStr = selectedCompanyId ? String(selectedCompanyId) : null;
            console.log('[Profile] 선택할 회사 ID:', targetCompanyIdStr);
            
            filteredCompanies.forEach(company => {
                const option = document.createElement('option');
                const companyIdStr = String(company.id);
                option.value = companyIdStr;
                option.textContent = company.name + ' (' + company.code + ')';
                
                // 현재 선택된 회사와 일치하면 selected
                if (targetCompanyIdStr && companyIdStr === targetCompanyIdStr) {
                    option.selected = true;
                    console.log('[Profile] 회사 선택됨:', company.name, 'ID:', company.id);
                }
                companySelect.appendChild(option);
            });
            
            companySelect.disabled = false;
            console.log('[Profile] 회사 선택 박스 활성화 완료');
            
            // 선택된 회사 ID가 있으면 강제로 설정
            if (targetCompanyIdStr) {
                console.log('[Profile] 회사 ID 강제 설정 시도:', targetCompanyIdStr);
                companySelect.value = targetCompanyIdStr;
                console.log('[Profile] 설정 후 companySelect.value:', companySelect.value);
                
                // 선택이 안 되었다면 다시 확인
                if (companySelect.value !== targetCompanyIdStr) {
                    console.log('[Profile] 회사 선택 실패, 수동 선택 시도');
                    const options = companySelect.options;
                    for (let i = 0; i < options.length; i++) {
                        if (String(options[i].value) === targetCompanyIdStr) {
                            companySelect.selectedIndex = i;
                            companySelect.value = targetCompanyIdStr;
                            console.log('[Profile] 수동 선택 성공, 인덱스:', i);
                            break;
                        }
                    }
                } else {
                    console.log('[Profile] 회사 선택 성공');
                }
            } else {
                console.log('[Profile] 선택할 회사 ID가 없음');
            }
            
            if (companyError) {
                companyError.style.display = 'none';
            }
        } catch (error) {
            console.error('[Profile] 회사 목록 로드 에러:', error);
            companySelect.innerHTML = '<option value="">회사 목록을 불러올 수 없습니다</option>';
            companySelect.disabled = true;
        }
    }
    
    // 회사 선택 시 에러 메시지 숨기기
    companySelect.addEventListener('change', function() {
        console.log('[Profile] 회사 변경 이벤트:', this.value);
        if (companyError && this.value) {
            companyError.style.display = 'none';
            this.classList.remove('error');
        }
    });
    
    console.log('[Profile] 초기화 완료');
});
