function initImageUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    const imageInput = document.getElementById('imageInput');
    const uploadedImages = document.getElementById('uploadedImages');
    const itemsPerPage = 6;
    let uploadedImagesList = [];

    // 이미지 표시 상태 업데이트 함수
    function updateImageDisplay() {
        if (uploadedImagesList.length === 0) {
            // 이미지가 없을 때 드래그 앤 드롭 영역 표시
            uploadedImages.innerHTML = `
                <div class="drag-drop-zone">
                    <div class="drag-drop-content">
                        <img src="images/default-image.svg" alt="업로드 이미지 아이콘" style="width: 48px; height: 48px; margin-bottom: 16px;">
                        <p>드래그 앤 드롭으로 이미지 업로드</p>
                    </div>
                </div>
            `;
            uploadedImages.classList.remove('has-images');
            // 버튼 텍스트 변경
            uploadBtn.textContent = '내 PC에서 파일 찾기';
        } else {
            // 이미지가 있을 때 그리드 표시
            uploadedImages.classList.add('has-images');
            showPage(1);
            // 버튼 텍스트 변경
            uploadBtn.textContent = '이미지 업로드';
        }
        updatePagination();
    }

    // 드래그 앤 드롭 이벤트 설정
    function setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadedImages.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadedImages.addEventListener(eventName, () => {
                if (uploadedImagesList.length === 0) {
                    uploadedImages.querySelector('.drag-drop-zone')?.classList.add('drag-over');
                }
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadedImages.addEventListener(eventName, () => {
                if (uploadedImagesList.length === 0) {
                    uploadedImages.querySelector('.drag-drop-zone')?.classList.remove('drag-over');
                }
            });
        });

        uploadedImages.addEventListener('drop', handleDrop);
    }

    function handleDrop(e) {
        const files = e.dataTransfer.files;
        handleFiles(files);
    }

    // 파일 처리 함수
    function handleFiles(files) {
        [...files].forEach(file => {
            if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
                alert('JPG 또는 PNG 파일만 업로드 가능합니다.');
                return;
            }
            
            if (file.size > 25 * 1024 * 1024) {
                alert('파일 크기는 25MB 이하여야 합니다.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImagesList.push(event.target.result);
                updateImageDisplay();
            };
            reader.readAsDataURL(file);
        });
    }

    // 이미지 그리드 표시 함수
    function showPage(pageNum) {
        const start = (pageNum - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageImages = uploadedImagesList.slice(start, end);
        
        uploadedImages.innerHTML = pageImages.map(imageData => `
            <div class="uploaded-image-item">
                <img src="${imageData}" alt="업로드된 이미지">
            </div>
        `).join('');

        // 이미지 클릭 이벤트 추가
        document.querySelectorAll('.uploaded-image-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const imageData = pageImages[index];
                fabric.Image.fromURL(imageData, (img) => {
                    const scale = Math.min(50 / img.width, 50 / img.height);
                    img.scale(scale);
                    
                    img.set({
                        left: fabricCanvas.width / 2 - (img.width * scale) / 2,
                        top: fabricCanvas.height / 2 - (img.height * scale) / 2
                    });

                    fabricCanvas.add(img);
                    fabricCanvas.renderAll();

                    const imageModal = document.getElementById('imageModal');
                    const modal = bootstrap.Modal.getInstance(imageModal);
                    modal.hide();
                });
            });
        });
    }

    // 페이지네이션 업데이트
    function updatePagination() {
        const pagination = document.getElementById('imagePagination');
        const totalPages = Math.ceil(uploadedImagesList.length / itemsPerPage);
        
        pagination.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.className = 'page-dot';
            button.setAttribute('data-page', i);
            button.onclick = () => {
                document.querySelectorAll('#imagePagination .page-dot')
                    .forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                showPage(i);
            };
            pagination.appendChild(button);
        }

        if (totalPages > 0) {
            pagination.querySelector('.page-dot').classList.add('active');
        }
    }

    // 이벤트 리스너 설정
    imageInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    uploadBtn.addEventListener('click', () => {
        imageInput.click();
    });

    // 드래그 앤 드롭 설정
    setupDragAndDrop();

    // 초기 화면 표시
    updateImageDisplay();

    const tooltipContent = '<div><strong>업로드 가능한 이미지 파일은 JPEG 또는 PNG파일이며 최대 25MB이하 입니다.</strong><br> 제품의 색상과 디자인 시안 색상은 모니터 사양이나 컬러모드(CMYK/RGB)에 따라 차이가 발생할 수 있으며 시안과 실제 제품의 인쇄 위치 및 크기의 오차가 발생할 수 있습니다. 이미지를 업로드하면 저작권에 대한 모든 권리와 책임이 있음을 인정하는 것입니다. 타인의 저작권 또는 개인정보 보호 권한을 침해하지 않음을 확인합니다.</div>';
    // 툴팁 초기화
    const tooltipTriggerList = document.querySelectorAll('[data-bs-custom-tooltip="true"]');
    tooltipTriggerList.forEach(el => {
        new bootstrap.Tooltip(el, {
            trigger: 'hover', // hover시에만 툴팁 표시
            placement: 'right', // 오른쪽에 표시
            container: 'body',
            html: true,
            title: tooltipContent
        });
    });
}

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', initImageUpload);