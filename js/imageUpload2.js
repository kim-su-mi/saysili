// 이미지 저장을 위한 전역 배열
let uploadedImages = [];
const IMAGES_PER_PAGE = 6;

document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('uploadedImages');
    const imageInput = document.getElementById('imageInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const imagePagination = document.getElementById('imagePagination');
    const imageModal = document.getElementById('imageModal');
    
    // 드래그 앤 드롭 이벤트 처리
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.backgroundColor = '#f8f9fa';
        this.style.border = '2px dashed #0d6efd';
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.backgroundColor = '';
        this.style.border = '';
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.backgroundColor = '';
        this.style.border = '';
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // 파일 입력 이벤트 처리
    uploadBtn.addEventListener('click', function() {
        imageInput.click();
    });

    imageInput.addEventListener('change', function(e) {
        handleFiles(this.files);
    });

    // 파일 처리 함수
    function handleFiles(files) {
        for (let file of files) {
            if (file.type.startsWith('image/')) {
                if (file.size <= 25 * 1024 * 1024) { // 25MB 제한
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        uploadedImages.push({
                            src: e.target.result,
                            name: file.name
                        });
                        updateImageGrid(1); // 첫 페이지로 이동
                    };
                    reader.readAsDataURL(file);
                } else {
                    alert('이미지 크기는 25MB를 초과할 수 없습니다.');
                }
            } else {
                alert('이미지 파일만 업로드 가능합니다.');
            }
        }
    }

    // 이미지를 캔버스에 추가하는 함수
    function addImageToCanvas(imgSrc) {
        // 현재 캔버스의 상태를 저장
        if (currentView) {
            fabric.Image.fromURL(imgSrc, function(img) {
                // 이미지 크기 조정
                const canvasWidth = fabricCanvas.width;
                const canvasHeight = fabricCanvas.height;
                
                // 이미지 비율 유지하면서 캔버스에 맞게 크기 조정
                const scale = Math.min(
                    (canvasWidth * 0.5) / img.width, 
                    (canvasHeight * 0.5) / img.height
                );
                
                img.scale(scale);
                
                // 이미지를 캔버스 중앙에 배치
                img.set({
                    left: canvasWidth / 2 - (img.width * scale) / 2,
                    top: canvasHeight / 2 - (img.height * scale) / 2
                });
                
                // 현재 뷰의 캔버스에 이미지 추가
                fabricCanvas.add(img);
                fabricCanvas.setActiveObject(img);
                fabricCanvas.renderAll();
                
                // 현재 뷰의 상태 저장
                const tempCanvas = new fabric.Canvas(null);
                tempCanvas.loadFromJSON(fabricCanvas.toJSON(), function() {
                    canvasInstances[currentView] = tempCanvas;
                    console.log(`Saved state for ${currentView}`);
                });
            });
        }
    }

    // 이미지 그리드 업데이트
    function updateImageGrid(currentPage) {
        const startIdx = (currentPage - 1) * IMAGES_PER_PAGE;
        const endIdx = startIdx + IMAGES_PER_PAGE;
        const pageImages = uploadedImages.slice(startIdx, endIdx);
        
        // 이미지 컨테이너 초기화
        dropZone.innerHTML = '';
        
        // 드래그 앤 드롭 안내 메시지 추가
        if (uploadedImages.length === 0) {
            const dropMessage = document.createElement('div');
            dropMessage.className = 'drop-message';
            dropMessage.style.textAlign = 'center';
            dropMessage.style.padding = '40px';
            dropMessage.style.border = '2px dashed #ddd';
            dropMessage.style.borderRadius = '8px';
            dropMessage.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <img src="/path/to/upload-icon.png" alt="Upload" style="width: 48px; height: 48px;">
                </div>
                <p>드래그 앤 드롭으로 이미지를 올려주세요</p>
                <p class="text-muted">또는</p>
                <button class="btn btn-outline-primary btn-sm">파일 선택</button>
            `;
            dropZone.appendChild(dropMessage);
        } else {
            // 이미지 그리드 생성
            const grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            grid.style.gap = '10px';
            grid.style.padding = '10px';
            
            pageImages.forEach(image => {
                const imgContainer = document.createElement('div');
                imgContainer.style.position = 'relative';
                imgContainer.style.aspectRatio = '1';
                imgContainer.style.overflow = 'hidden';
                imgContainer.style.border = '1px solid #ddd';
                imgContainer.style.borderRadius = '8px';
                imgContainer.style.cursor = 'pointer';
                
                const img = document.createElement('img');
                img.src = image.src;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                
                // 이미지 클릭 이벤트 추가
                imgContainer.addEventListener('click', function() {
                    addImageToCanvas(image.src);
                    // 모달 닫기
                    const modal = bootstrap.Modal.getInstance(imageModal);
                    if (modal) {
                        modal.hide();
                    }
                });
                
                imgContainer.appendChild(img);
                grid.appendChild(imgContainer);
                
                // 호버 효과 추가
                imgContainer.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.05)';
                    this.style.transition = 'transform 0.2s';
                    this.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
                });
                
                imgContainer.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                    this.style.boxShadow = 'none';
                });
            });
            
            dropZone.appendChild(grid);
        }
        
        // 페이지네이션 업데이트
        updatePagination(currentPage);
    }

    // 페이지네이션 업데이트
    function updatePagination(currentPage) {
        const totalPages = Math.ceil(uploadedImages.length / IMAGES_PER_PAGE);
        imagePagination.innerHTML = '';
        
        if (totalPages > 1) {
            // 이전 페이지 버튼
            if (currentPage > 1) {
                const prevBtn = createPageButton(currentPage - 1, '이전');
                imagePagination.appendChild(prevBtn);
            }
            
            // 페이지 번호 버튼
            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = createPageButton(i, i.toString());
                if (i === currentPage) {
                    pageBtn.classList.add('active');
                }
                imagePagination.appendChild(pageBtn);
            }
            
            // 다음 페이지 버튼
            if (currentPage < totalPages) {
                const nextBtn = createPageButton(currentPage + 1, '다음');
                imagePagination.appendChild(nextBtn);
            }
        }
    }

    // 페이지 버튼 생성 함수
    function createPageButton(pageNum, text) {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary btn-sm mx-1';
        button.textContent = text;
        button.addEventListener('click', () => updateImageGrid(pageNum));
        return button;
    }

    // 초기 그리드 설정
    updateImageGrid(1);
});