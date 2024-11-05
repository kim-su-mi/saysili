function initImageUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    const imageInput = document.getElementById('imageInput');
    const uploadedImages = document.getElementById('uploadedImages');
    const itemsPerPage = 6; // 페이지당 이미지 수
    let uploadedImagesList = []; // 업로드된 이미지들을 저장할 배열

    // 페이지 표시 함수
    function showPage(pageNum) {
        const start = (pageNum - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageImages = uploadedImagesList.slice(start, end);
        
        uploadedImages.innerHTML = '';
        pageImages.forEach(imageData => {
            const imageItem = createImageItem(imageData);
            uploadedImages.appendChild(imageItem);
        });
    }

    // 페이지네이션 업데이트
    function updatePagination() {
        const totalPages = Math.ceil(uploadedImagesList.length / itemsPerPage);
        const pagination = document.getElementById('imagePagination');
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

        // 첫 페이지 버튼 활성화
        if (totalPages > 0) {
            pagination.querySelector('.page-dot').classList.add('active');
        }
    }

    // 이미지 아이템 생성 함수
    function createImageItem(imageData) {
        const imageItem = document.createElement('div');
        imageItem.className = 'uploaded-image-item';
        imageItem.innerHTML = `<img src="${imageData}" alt="업로드된 이미지">`;
        
        imageItem.addEventListener('click', () => {
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

        return imageItem;
    }

    // 파일 업로드 처리
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        
        if (!file) return;
        
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
            updatePagination();
            showPage(Math.ceil(uploadedImagesList.length / itemsPerPage));
        };
        reader.readAsDataURL(file);
    });

    uploadBtn.addEventListener('click', () => {
        imageInput.click();
    });
}

// DOMContentLoaded 이벤트에 추가
document.addEventListener('DOMContentLoaded', function() {
    
    initImageUpload();
});