// 공통 페이징 클래스
class PaginationUI {
    constructor(container, options) {
        this.container = container;
        this.currentPage = options.currentPage || 1;
        this.totalPages = options.totalPages || 0;
        this.totalCount = options.totalCount || 0;
        this.size = options.size || 10;
        this.baseUrl = options.baseUrl || window.location.pathname;
        this.params = options.params || {};
    }

    // 쿼리스트링 포함한 URL 생성
    buildUrl(page) {
        const url = new URL(this.baseUrl, window.location.origin);
        const params = new URLSearchParams();

        Object.entries(this.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, value);
            }
        });

        params.set('page', page);
        // size 파라미터 유지 (존재하는 경우)
        if (this.size) {
            params.set('size', String(this.size));
        }
        url.search = params.toString();
        return url.toString();
    }

    createButton(label, page, extraClass = '', disabled = false) {
        if (disabled) {
            const span = document.createElement('span');
            span.className = (`btn btn-secondary disabled ${extraClass}`).trim();
            span.textContent = label;
            return span;
        }

        const a = document.createElement('a');
        a.className = (`btn btn-secondary ${extraClass}`).trim();
        a.textContent = label;
        a.href = this.buildUrl(page);
        return a;
    }

    render() {
        if (!this.container || this.totalPages <= 0) return;

        this.container.innerHTML = '';

        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.className = 'pagination-buttons';

        const pageInfoWrapper = document.createElement('div');
        pageInfoWrapper.className = 'page-info';

        // «, ‹
        if (this.currentPage > 1) {
            buttonsWrapper.appendChild(this.createButton('«', 1));
            buttonsWrapper.appendChild(this.createButton('‹', this.currentPage - 1));
        }

        // 페이지 번호 + ... (기존 템플릿 로직을 JS로 구현)
        for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
            const isCurrent = pageNum === this.currentPage;

            const showNumber =
                pageNum === this.currentPage ||
                pageNum <= 3 ||
                pageNum > this.totalPages - 3 ||
                (pageNum >= this.currentPage - 1 && pageNum <= this.currentPage + 1);

            if (showNumber) {
                const a = document.createElement('a');
                a.textContent = pageNum;
                a.href = this.buildUrl(pageNum);
                a.className = isCurrent
                    ? 'btn btn-primary pagination-current'
                    : 'btn btn-secondary';
                buttonsWrapper.appendChild(a);
            } else if (pageNum === 4 && this.currentPage > 5) {
                const span = document.createElement('span');
                span.className = 'pagination-ellipsis';
                span.textContent = '...';
                buttonsWrapper.appendChild(span);
            } else if (pageNum === this.totalPages - 3 && this.currentPage < this.totalPages - 4) {
                const span = document.createElement('span');
                span.className = 'pagination-ellipsis';
                span.textContent = '...';
                buttonsWrapper.appendChild(span);
            }
        }

        // ›, »
        if (this.currentPage < this.totalPages) {
            buttonsWrapper.appendChild(this.createButton('›', this.currentPage + 1));
            buttonsWrapper.appendChild(this.createButton('»', this.totalPages));
        }

        // "총 N건 중 a-b건 표시"
        if (this.totalCount != null && this.size != null) {
            const start = (this.currentPage - 1) * this.size + 1;
            const end = this.currentPage * this.size > this.totalCount
                ? this.totalCount
                : this.currentPage * this.size;

            const span = document.createElement('span');
            span.textContent = `총 ${this.totalCount}건 중 ${start}-${end}건 표시`;
            pageInfoWrapper.appendChild(span);
        }

        this.container.appendChild(buttonsWrapper);
        this.container.appendChild(pageInfoWrapper);
    }
}

