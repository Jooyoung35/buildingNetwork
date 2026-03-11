// 빌딩 선택 시 회사 목록 로드
document.addEventListener('DOMContentLoaded', function() {
    const buildingSelect = document.getElementById('buildingId');
    const companySelect = document.getElementById('companyId');
    
    if (!buildingSelect || !companySelect) return;
    
    const currentBuildingId = buildingSelect;
    const currentCompanyId = document.getElementById('currentCompanyId');
    
    // 초기 로드 시 빌딩이 선택되어 있으면 회사 목록 로드
    if (currentBuildingId && buildingSelect.value) {
        // 빌딩이 이미 선택되어 있으면 바로 회사 목록 로드
        loadCompaniesByBuilding(currentBuildingId.value, currentCompanyId.value);
    }
    
    buildingSelect.addEventListener('change', async function() {
        const buildingId = this.value;
        
        if (!buildingId || buildingId === '') {
            companySelect.innerHTML = '<option value="">먼저 빌딩을 선택하세요</option>';
            companySelect.disabled = true;
            companySelect.value = '';
            return;
        }
        
        await loadCompaniesByBuilding(buildingId, null);
    });
    
    async function loadCompaniesByBuilding(buildingId, selectedCompanyId) {
        if (!companySelect || !buildingId) return;
        
        try {
            companySelect.innerHTML = '<option value="">로딩 중...</option>';
            companySelect.disabled = true;
            
            const response = await fetch(`/api/companies/by-building?buildingId=${buildingId}`);
            
            if (!response.ok) {
                throw new Error('Failed to load companies');
            }
            
            const companies = await response.json();
            
            // master 회사 제외
            const filteredCompanies = companies.filter(company => company.name !== 'master');
            
            companySelect.innerHTML = '<option value="">회사를 선택하세요</option>';
            
            // selectedCompanyId를 문자열로 변환하여 비교
            const targetCompanyIdStr = selectedCompanyId ? String(selectedCompanyId) : null;
            
            filteredCompanies.forEach(company => {
                const option = document.createElement('option');
                const companyIdStr = String(company.id);
                option.value = companyIdStr;
                option.textContent = company.name + ' (' + company.code + ')';
                
                // 현재 선택된 회사와 일치하면 selected
                if (targetCompanyIdStr && companyIdStr === targetCompanyIdStr) {
                    option.selected = true;
                }
                companySelect.appendChild(option);
            });
            
            companySelect.disabled = false;
            
            // 선택된 회사 ID가 있으면 강제로 설정
            if (targetCompanyIdStr) {
                // select의 value를 직접 설정
                companySelect.value = targetCompanyIdStr;
                
                // 선택이 안 되었다면 다시 확인
                if (companySelect.value !== targetCompanyIdStr) {
                    // 모든 option을 확인하여 수동으로 선택
                    const options = companySelect.options;
                    for (let i = 0; i < options.length; i++) {
                        if (String(options[i].value) === targetCompanyIdStr) {
                            companySelect.selectedIndex = i;
                            companySelect.value = targetCompanyIdStr;
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading companies:', error);
            companySelect.innerHTML = '<option value="">회사 목록을 불러올 수 없습니다</option>';
            companySelect.disabled = true;
        }
    }
});
