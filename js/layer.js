// 레이어 패널 토글 기능
document.addEventListener('DOMContentLoaded', function() {
    const layerPanel = document.querySelector('.layer-panel');
    const toggleBtn = layerPanel.querySelector('.toggle-btn');
    const layerContent = layerPanel.querySelector('.layer-content');

    toggleBtn.addEventListener('click', function() {
        layerPanel.classList.toggle('collapsed');
        layerContent.classList.toggle('show');
    });

    // 레이어 가시성 토글
    const visibilityToggles = document.querySelectorAll('.visibility-toggle');
    visibilityToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.style.opacity = this.style.opacity === '1' ? '0.3' : '1';
            // 여기에 캔버스 객체 표시/숨김 로직 추가
        });
    });

    // 레이어 잠금 토글
    const lockBtns = document.querySelectorAll('.lock-btn');
    lockBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.textContent = this.textContent === '🔒' ? '🔓' : '🔒';
            // 여기에 캔버스 객체 잠금/잠금해제 로직 추가
        });
    });

    // 레이어 삭제
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const layerItem = this.closest('.layer-item');
            if (confirm('이 레이어를 삭제하시겠습니까?')) {
                layerItem.remove();
                // 여기에 캔버스 객체 삭제 로직 추가
            }
        });
    });
});