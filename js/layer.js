document.addEventListener('DOMContentLoaded', function() {
    const layerPanel = document.querySelector('.layer-panel');
    const toggleBtn = layerPanel.querySelector('.toggle-btn');
    const layerContent = layerPanel.querySelector('.layer-content');
    
    // 레이어 패널 토글
    toggleBtn.addEventListener('click', function() {
        layerPanel.classList.toggle('collapsed');
        layerContent.classList.toggle('show');
    });

    // 레이어 아이템 생성 함수
    window.createLayerItem = function(obj, index) {
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.dataset.objectId = obj.id; // fabric 객체의 ID 저장

        layerItem.innerHTML = `
            <div class="layer-info">
                <span class="layer-name">레이어 ${index}</span>
            </div>
            <div class="layer-controls">
                <button class="visibility-btn" title="숨기기">👁</button>
                <button class="lock-btn" title="잠금">🔓</button>
                <button class="delete-btn" title="삭제">🗑</button>
            </div>
        `;

        // 레이어 클릭 이벤트 추가
        layerItem.querySelector('.layer-info').addEventListener('click', function(e) {
            // 버튼 클릭 시에는 이벤트 처리하지 않음
            if (!e.target.closest('.layer-controls')) {
                fabricCanvas.discardActiveObject(); // 기존 선택 해제
                fabricCanvas.setActiveObject(obj); // 해당 객체 선택
                fabricCanvas.renderAll();
            }
        });

        // 숨기기 버튼 이벤트
        layerItem.querySelector('.visibility-btn').addEventListener('click', function() {
            const isVisible = obj.visible;
            obj.set('visible', !isVisible);
            this.textContent = isVisible ? '👁‍🗨' : '👁';
            fabricCanvas.renderAll();
        });

        // 잠금 버튼 이벤트
        layerItem.querySelector('.lock-btn').addEventListener('click', function() {
            const isLocked = obj.lockMovementX;
            obj.set({
                lockMovementX: !isLocked,
                lockMovementY: !isLocked,
                lockRotation: !isLocked,
                lockScalingX: !isLocked,
                lockScalingY: !isLocked,
                selectable: isLocked,
                hoverCursor: !isLocked ? 'default' : 'move',
                moveCursor: !isLocked ? 'default' : 'move'
            });
            this.textContent = isLocked ? '🔓' : '🔒';
            fabricCanvas.renderAll();
        });

        // 삭제 버튼 이벤트
        layerItem.querySelector('.delete-btn').addEventListener('click', function() {
            if (confirm('이 레이어를 삭제하시겠습니까?')) {
                fabricCanvas.remove(obj);
                layerItem.remove();
                updateLayerIndices();
            }
        });

        layerContent.appendChild(layerItem);
    };

    // 레이어 인덱스 업데이트
    function updateLayerIndices() {
        const layerItems = layerContent.querySelectorAll('.layer-item');
        layerItems.forEach((item, index) => {
            item.querySelector('.layer-name').textContent = `레이어 ${index + 1}`;
        });
    }
});