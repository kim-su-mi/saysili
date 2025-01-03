function initImageUpload() {
    const uploadBtn = document.getElementById('uploadBtn'); // 이미지 업로드 버튼
    const imageInput = document.getElementById('imageInput'); //파일업로드 input박스
    const uploadedImages = document.getElementById('uploadedImages'); // 업로드된 이미지 영역
    const itemsPerPage = 6; // 한 페이지에 표시될 이미지 수
    let uploadedImagesList = []; // 업로드된 이미지 목록

    // 이미지 표시 상태 업데이트 함수
    function updateImageDisplay() {
        if (uploadedImagesList.length === 0) {
            // 모바일/태블릿 여부 확인
            const isMobileOrTablet = window.innerWidth <= 767;
            
            // 화면 크기에 따라 다른 내용 표시
            uploadedImages.innerHTML = isMobileOrTablet ? `
                <div class="drag-drop-zone mobile">
                    <div class="drag-drop-content">
                        <p><strong>업로드 가능한 이미지 파일은 JPEG 또는 PNG파일이며 최대 25MB이하 입니다.</strong><br> 제품의 색상과 디자인 시안 색상은 모니터 사양이나 컬러모드(CMYK/RGB)에 따라 차이가 발생할 수 있으며 시안과 실제 제품의 인쇄 위치 및 크기의 오차가 발생할 수 있습니다. 이미지를 업로드하면 저작권에 대한 모든 권리와 책임이 있음을 인정하는 것입니다. 타인의 저작권 또는 개인정보 보호 권한을 침해하지 않음을 확인합니다.</p>
                    </div>
                </div>
            ` : `
                <div class="drag-drop-zone pc">
                    <div class="drag-drop-content">
                        <img alt="업로드 이미지 아이콘" src="images/uploadImg.png" style="width: 48px; height: 48px; margin-bottom: 16px;">
                        <p>드래그 앤 드롭으로 이미지 업로드</p>
                    </div>
                </div>
            `;
            
            uploadedImages.classList.remove('has-images');
            uploadBtn.textContent = '내 PC에서 파일 찾기';
        } else {
            // 이미지가 있을 때 그리드 표시
            uploadedImages.classList.add('has-images');
            showPage(1); // 이미지가 업로드 돼었을 때 항상 1번째 페이지를 보여주기위해
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
                uploadedImagesList.unshift(event.target.result);
                updateImageDisplay();
            };
            reader.readAsDataURL(file);
        });
    }

    // 이미지 그리드 표시 함수
    function showPage(pageNum) {
        // 1. 페이지에 표시할 이미지의 시작과 끝 인덱스 계산
        const start = (pageNum - 1) * itemsPerPage; // itemsPerPage는 한 페이지당 표시할 이미지 수(6개)
        const end = start + itemsPerPage;
        const pageImages = uploadedImagesList.slice(start, end); //최근 추가된 이미지를 제일 앞에 보이게 하기위해 배열 뒤집음 , 배열에서 start부터 end까지의 이미지를 추출
        
        // 2. 이미지 HTML 생성 및 표시
        uploadedImages.innerHTML = pageImages.map(imageData => `
            <div class="uploaded-image-item">
                <img src="${imageData}" alt="업로드된 이미지">
            </div>
        `).join('');

        // 3. 각 이미지에 클릭 이벤트 추가
        document.querySelectorAll('.uploaded-image-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const imageData = pageImages[index];
                const initialColor = getInitialColor(fabricCanvas); // 초기 색상 가져오기
                
                fabric.Image.fromURL(imageData, (img) => {
                    if (window.historyManager) {
                        window.historyManager.recordState(() => {
                            const scale = Math.min(100 / img.width, 100 / img.height);
                            img.scale(scale);
                            
                            img.set({
                                left: fabricCanvas.width / 2 - (img.width * scale) / 2,
                                top: fabricCanvas.height / 2 - (img.height * scale) / 2,
                                objectType: 'image'
                            });

                            // 이미지 색상 변경
                            changeImageColor(img, initialColor);

                            fabricCanvas.add(img);
                            fabricCanvas.setActiveObject(img);
                            fabricCanvas.renderAll();
                            
                            // 색상 버튼 생성
                            createColorButtons(img);
                            
                            // 모달 닫기
                            const imageModal = document.getElementById('imageModal');
                            const modal = bootstrap.Modal.getInstance(imageModal);
                            modal.hide();
                        });
                    }
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

    // 업로드할 파일이 선택됐을 때 파일의 확장자나 크기 확인
    imageInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // 이미지 업로드 버튼을 클릭하면 숨겨진 <input type=file>요소를 클릭하게 동작
    uploadBtn.addEventListener('click', () => {
        imageInput.click();
    });

    // 드래그 앤 드롭 설정
    setupDragAndDrop();

    // 윈도우 리사이즈 이벤트에 대한 처리 추가
    window.addEventListener('resize', () => {
        if (uploadedImagesList.length === 0) {
            updateImageDisplay();
        }
    });

    // 초기 화면 표시
    updateImageDisplay();

    // 툴팁 설정
    const tooltipContent = '<div><strong>업로드 가능한 이미지 파일은 JPEG 또는 PNG파일이며 최대 25MB이하 입니다.</strong><br> 제품의 색상과 디자인 시안 색상은 모니터 사양이나 컬러모드(CMYK/RGB)에 따라 차이가 발생할 수 있으며 시안과 실제 제품의 인쇄 위치 및 크기의 오차가 발생할 수 있습니다. 이미지를 업로드하면 저작권에 대한 모든 권리와 책임이 있음을 인정하는 것입니다. 타인의 저작권 또는 개인정보 보호 권한을 침해하지 않음을 확인합니다.</div>';
    
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

    const silkTooltip = document.querySelectorAll('[data-bs-silk-tooltip="true"]');
    silkTooltip.forEach(el => {
        new bootstrap.Tooltip(el, {
            trigger: 'hover', // hover시에만 툴팁 표시
            placement: 'bottom', // 오른쪽에 표시
            container: 'body',
            html: true,
            title: '실크인쇄'
        });
    });

    const engravingTooltip = document.querySelectorAll('[data-bs-engraving-tooltip="true"]');
    engravingTooltip.forEach(el => {
        new bootstrap.Tooltip(el, {
            trigger: 'hover', // hover시에만 툴팁 표시
            placement: 'bottom', // 오른쪽에 표시
            container: 'body',
            html: true,
            title: '음각인쇄'
        });
    });

    const bulkTooltip = document.querySelectorAll('[data-bs-bulk-tooltip="true"]');
    bulkTooltip.forEach(el => {
        new bootstrap.Tooltip(el, {
            trigger: 'hover', // hover시에만 툴팁 표시
            placement: 'bottom', // 오른쪽에 표시
            container: 'body',
            html: true,
            title: '벌크포장'
        });
    });

    const oppTooltip = document.querySelectorAll('[data-bs-opp-tooltip="true"]');
    oppTooltip.forEach(el => {
        new bootstrap.Tooltip(el, {
            trigger: 'hover', // hover시에만 툴팁 표시
            placement: 'bottom', // 오른쪽에 표시
            container: 'body',
            html: true,
            title: '개별 OPP'
        });
    });

    const paperTooltip = document.querySelectorAll('[data-bs-paper-tooltip="true"]');
    paperTooltip.forEach(el => {
        new bootstrap.Tooltip(el, {
            trigger: 'hover', // hover시에만 툴팁 표시
            placement: 'bottom', // 오른쪽에 표시
            container: 'body',
            html: true,
            title: 'OPP+내지'
        });
    });

    const stickerTooltip = document.querySelectorAll('[data-bs-sticker-tooltip="true"]');
    stickerTooltip.forEach(el => {
        new bootstrap.Tooltip(el, {
            trigger: 'hover', // hover시에만 툴팁 표시
            placement: 'bottom', // 오른쪽에 표시
            container: 'body',
            html: true,
            title: 'OPP+스티커'
        });
    });
}

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', initImageUpload);