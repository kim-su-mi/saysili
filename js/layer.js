let layerInstances = {
    'outer-front': [],
    'outer-back': [],
    'inner-front': [],
    'inner-back': []
};

// updateLayerIndex 함수를 전역으로 선언
window.updateLayerIndex = function(element, index) {
    const layerNameEl = element.querySelector('.layer-name');
    const currentName = layerNameEl.textContent.split(' ')[0]; // "Text", "Image" 등을 유지
    layerNameEl.textContent = `${currentName} ${index}`;
};

// updateLayerIndices 함수를 전역으로 선언
window.updateLayerIndices = function() {
    layerInstances[currentView].forEach((layer, index) => {
        updateLayerIndex(layer.element, index + 1);
    });
};

// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    const layerPanel = document.querySelector('.layer-panel');
    const toggleBtn = layerPanel.querySelector('.toggle-btn');
    const layerContent = layerPanel.querySelector('.layer-content');
    
    // 레이어 패널 접기/펼치기 토글 기능
    toggleBtn.addEventListener('click', function() {
        layerPanel.classList.toggle('collapsed');// 패널 접힘/펼침 클래스 토글
        layerContent.classList.toggle('show');// 레이어 컨텐츠 표시/숨김 클래스 토글
    });

    // 전역에서 접근 가능하도록 window 객체에 함수 등록
    // fabricCanvas에서 객체가 추가될 때 이 함수를 호출
    window.createLayerItem = function(obj, index) {
        // 이미 해당 객체의 레이어가 존재하는지 확인
        const existingLayer = layerInstances[currentView].find(layer => 
            layer.fabricObject && layer.fabricObject.id === obj.id
        );
        
        if (existingLayer) {
            return existingLayer;
        }
        // 새로운 레이어 아이템 요소 생성
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.dataset.objectId = obj.id; // fabric 객체의 ID를 데이터 속성으로 저장, 레이어와 캔버스 객체를 연결

        // Determine layer name based on object type
        let layerName = 'Layer';
        if (obj instanceof fabric.IText) {
            layerName = 'Text';
        } else if (obj instanceof fabric.Image) {
            layerName = 'Image';
        } else if (obj.type === 'group' || obj instanceof fabric.Group || obj._objects) {
            layerName = 'Template';
        }

        layerItem.innerHTML = `
            <div class="layer-info">
                <span class="layer-name">${layerName} ${index}</span>
            </div>
            <div class="layer-controls">
                <button class="visibility-btn" title="숨기기">👁</button>
                <button class="lock-btn" title="잠금">🔓</button>
                <button class="delete-btn" title="삭제">🗑</button>
            </div>
    `   ;

        // 레이어 객체 생성
        const layer = {
            element: layerItem,
            fabricObject: obj
        };

        // 현재 뷰의 레이어 배열에 추가
        layerInstances[currentView].push(layer);

        setupLayerControls(layer, layerItem);

       

        return layer;
    };
    function setupLayerControls(layer, layerItem) {
        // 레이어 클릭 이벤트
        layerItem.querySelector('.layer-info').addEventListener('click', function(e) {
            if (!e.target.closest('.layer-controls')) {
                fabricCanvas.discardActiveObject();
                fabricCanvas.setActiveObject(layer.fabricObject);
                fabricCanvas.renderAll();
            }
        });
    
        // 숨기기 버튼 초기 상태 설정
        const visibilityBtn = layerItem.querySelector('.visibility-btn');
        visibilityBtn.textContent = layer.fabricObject.visible ? '👁' : '👁‍🗨';
    
        // 숨기기 버튼 이벤트
        visibilityBtn.addEventListener('click', function() {
            const isVisible = layer.fabricObject.visible;
            layer.fabricObject.set('visible', !isVisible);
            this.textContent = isVisible ? '👁‍🗨' : '👁';
            fabricCanvas.renderAll();
        });
    
        // 잠금 버튼 초기 상태 설정
        const lockBtn = layerItem.querySelector('.lock-btn');
        lockBtn.textContent = layer.fabricObject.lockMovementX ? '🔒' : '🔓';
    
        // 잠금 버튼 이벤트
        lockBtn.addEventListener('click', function() {
            const isLocked = layer.fabricObject.lockMovementX;
            layer.fabricObject.set({
                lockMovementX: !isLocked,
                lockMovementY: !isLocked,
                lockRotation: !isLocked,
                lockScalingX: !isLocked,
                lockScalingY: !isLocked,
                selectable: !isLocked,
                hoverCursor: isLocked ? 'move' : 'default',
                moveCursor: isLocked ? 'move' : 'default'
            });
            this.textContent = isLocked ? '🔓' : '🔒';
            fabricCanvas.renderAll();
        });
    
        // 삭제 버튼 이벤트는 동일
        layerItem.querySelector('.delete-btn').addEventListener('click', function() {
            if (confirm('이 레이어를 삭제하시겠습니까?')) {
                fabricCanvas.remove(layer.fabricObject);
                layerItem.remove();
                
                const index = layerInstances[currentView].findIndex(l => l === layer);
                if (index > -1) {
                    layerInstances[currentView].splice(index, 1);
                }
                
                updateLayerIndices();
            }
        });
    }

    // 레이어 패널 업데이트 함수 추가
    window.updateLayerPanel = function(view) {
        const layerContent = document.querySelector('.layer-content');
        // 기존 레이어 아이템들 제거
        while (layerContent.firstChild) {
            layerContent.removeChild(layerContent.firstChild);
        }

        // 선택된 뷰의 레이어 아이템들 추가
        layerInstances[view].forEach((layer, index) => {
            if (layer.element && layer.fabricObject) {
                layerContent.appendChild(layer.element);
                updateLayerIndex(layer.element, index + 1);
            }
        });
    };
});