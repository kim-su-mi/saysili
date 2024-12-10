function initTemplatesUpload() {
    // 원래 모달의 이벤트 리스너들을 다시 설정하는 함수
    function setupOriginalModalEvents() {
        // 모든 템플릿 아이템에 대해 클릭 이벤트 다시 설정
        const templateItems = document.querySelectorAll('.template-item');
        templateItems.forEach(item => {
            item.onclick = function() {
                const templateType = this.dataset.template;
                const templateTitle = this.querySelector('p').textContent;
                showDetailPage(templateType, templateTitle);
            };
        });

        // 페이지네이션 버튼 이벤트 다시 설정
        const pageButtons = document.querySelectorAll('.page-dot');
        const templatePages = document.querySelectorAll('.template-page');
        pageButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pageNum = button.dataset.page;
                templatePages.forEach(page => {
                    page.style.display = 'none';
                });
                document.querySelector(`.template-page[data-page="${pageNum}"]`).style.display = 'grid';
                pageButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }
    

    // 상세 페이지 표시 함수
    async function showDetailPage(templateType, templateTitle) {
        // 1. 템플릿 모달의 content를 찾습니다.
        const templateModal = document.getElementById('templateModal');
        const modalContent = templateModal.querySelector('.modal-content');
        
        // 1-1. 원래 모달 내용 저장
        const originalContent = modalContent.innerHTML;

        // 2. 새로운 모달 내용으로 변경
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>${templateTitle}</h2>
                <button class="back-btn">← 뒤로가기</button>
            </div>
            <div class="detail-template-grid" id="detailGrid"></div>
            <div class="pagination" id="detailPagination"></div>
        `;
    
        // 3. SVG 파일 로드
        try {
            const templatePath = `templates/${templateType}/`;  // 경로 설정
            const response = await fetch(templatePath);         // 폴더 내용 가져오기
            const files = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(files, 'text/html');
            const images = Array.from(doc.querySelectorAll('a'))
                .filter(a => a.href.match(/\.svg$/i))  // SVG 파일만 필터링
                .map(a => a.href);
    
            // 4. 페이지네이션 처리
            const itemsPerPage = 16;  // 한 페이지당 16개 이미지
            const totalPages = Math.ceil(images.length / itemsPerPage);
            
            // 페이지 표시 함수
            function showPage(pageNum) {
                const start = (pageNum - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const pageImages = images.slice(start, end);  // 현재 페이지에 표시할 이미지들
                
                const detailGrid = document.getElementById('detailGrid');
                detailGrid.innerHTML = '';
                
                // 이미지 그리드 생성
                pageImages.forEach(imgSrc => {
                    const item = document.createElement('div');
                    item.className = 'detail-template-item';
                    item.innerHTML = `<img src="${imgSrc}" alt="템플릿 이미지">`;
                    item.onclick = () => {
                        // SVG 이미지를 Fabric Canvas에 추가
                        fabric.loadSVGFromURL(imgSrc, function(objects, options) {
                            if (window.historyManager) {
                                window.historyManager.recordState(() => {
                                    const initialColor = getInitialColor(fabricCanvas); // 초기 색상 가져오기
                                    
                                    // 템플릿 객체의 색상 변경
                                    changeTemplateColor(objects, initialColor);

                                    const loadedObject = fabric.util.groupSVGElements(objects, options);

                                    // 이미지 크기 조정 (필요한 경우)
                                    loadedObject.scaleToWidth(50);  // 원하는 크기로 조정
                                    
                                    // Group으로 변환
                                    const group = new fabric.Group([loadedObject], {
                                        left: fabricCanvas.width / 2 - loadedObject.width * loadedObject.scaleX / 2,
                                        top: fabricCanvas.height / 2 - loadedObject.height * loadedObject.scaleY / 2,
                                        selectable: true,
                                        evented: true,
                                        objectType: 'template'
                                    });
                                    
                                    // Canvas에 추가
                                    fabricCanvas.add(group);
                                    fabricCanvas.setActiveObject(group);
                                    fabricCanvas.renderAll();

                                    // 색상 버튼 생성
                                    createColorButtons(group);
                                    
                                    // 부트스트랩 모달 인스턴스를 가져와서 닫기
                                    const templateModal = document.getElementById('templateModal');
                                    const modal = bootstrap.Modal.getInstance(templateModal);
                                    modal.hide();
                                });
                            }
                        });
                    };
                    detailGrid.appendChild(item);
                });
            }
    
            // 페이지네이션 버튼 생
            const pagination = document.getElementById('detailPagination');
            pagination.innerHTML = '';
            
            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement('button');
                button.className = 'page-dot';
                button.setAttribute('data-page', i);
                button.onclick = () => {
                    document.querySelectorAll('#detailPagination .page-dot')
                        .forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    showPage(i);
                };
                pagination.appendChild(button);
            }
    
            // 첫 페이지 표시
            if (totalPages > 0) {
                showPage(1);
                pagination.querySelector('.page-dot').classList.add('active');
            }
    
        } catch (error) {
            console.error('Error loading template images:', error);
            document.getElementById('detailGrid').innerHTML = 
                '<p style="grid-column: 1/-1; text-align: center;">Error loading templates</p>';
        }
    
        // 5. 뒤로가기 버튼 이벤트
        modalContent.querySelector('.back-btn').onclick = function() {
            modalContent.innerHTML = originalContent;  // 원래 내용으로 복원
            setupOriginalModalEvents();  // 이벤트 리스너 다시 설정
        };
    }

    // 처음 템플릿 아이템 클릭시 이벤트 설정
    setupOriginalModalEvents();

    // 첫 페이지 버튼을 기본으로 활성화
    document.querySelector('.page-dot').classList.add('active');
}


// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', initTemplatesUpload);