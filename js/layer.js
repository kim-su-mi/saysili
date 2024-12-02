let layerInstances = {
    'outer-front': [],
    'outer-back': [],
    'inner-front': [],
    'inner-back': []
};

// updateLayerIndex 함수를 전역으로 선언
window.updateLayerIndex = function(element, index) {
    const layerNameEl = element.querySelector('.layer_title');
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
    const layerContent = layerPanel.querySelector('#layer-content');
    
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

        
        let layerName = 'template';  // 기본값을 Template로 설정
        if (obj instanceof fabric.IText) {
            layerName = 'Text';
        } else if (obj instanceof fabric.Image) {
            layerName = 'Image';
        } else if (obj.objectType === 'group') {
            layerName = 'Group';
        }
        // let layerName = 'Layer';  // 기본값
        // if (obj.type === 'template') {
        //     layerName = 'Template';
        // } else if (obj instanceof fabric.IText) {
        //     layerName = 'Text';
        // } else if (obj instanceof fabric.Image) {
        //     layerName = 'Image';
        // }
        
        // 새로운 레이어 아이템 요소 생성
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.dataset.objectId = obj.id; // fabric 객체의 ID를 HTML 요소에 데이터 속성으로 저장, 레이어와 캔버스 객체를 연결

        layerItem.innerHTML = `
            <div class="layertitlediv">
                <span class="layer_title">${layerName} ${index}</span>
            </div>
            <div class="layerbtndiv">
                <button id="layer_hide" class="visibility-btn" title="숨기기">👁</button>
                <button id="layer_lock" class="lock-btn" title="잠금">🔓</button>
                <button id="layer_delete" class="delete-btn" title="삭제">🗑</button>
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
        layerItem.querySelector('.layertitlediv').addEventListener('click', function(e) {
            if (!e.target.closest('.layerbtndiv') && !layer.fabricObject.lockMovementX) {
                fabricCanvas.discardActiveObject();
                fabricCanvas.setActiveObject(layer.fabricObject);
                fabricCanvas.renderAll();
            }
        });
    
        // 숨기기 버튼 초기 상태 설정
        const visibilityBtn = layerItem.querySelector('#layer_hide');
        visibilityBtn.textContent = layer.fabricObject.visible ? '👁' : '👁‍🗨';
    
        // 숨기기 버튼 이벤트
        visibilityBtn.addEventListener('click', function() {
            if (window.historyManager) {
                window.historyManager.recordState(() => {
                    const isVisible = layer.fabricObject.visible;
                    layer.fabricObject.set('visible', !isVisible);
                    this.textContent = isVisible ? '👁‍🗨' : '👁';
                    fabricCanvas.renderAll();
                    saveCurrentCanvasState(); // 상태 저장
                });
            }
        });
    
        // 잠금 버튼 초기 상태 설정
        const lockBtn = layerItem.querySelector('#layer_lock');
        lockBtn.textContent = layer.fabricObject.lockMovementX ? '🔒' : '🔓';
    
        // 잠금 버튼 이벤트
        lockBtn.addEventListener('click', function() {
            if (window.historyManager) {
                window.historyManager.recordState(() => {
                    const isLocked = layer.fabricObject.lockMovementX;
                    const newLockState = !isLocked;
                    
                    layer.fabricObject.set({
                        lockMovementX: newLockState,
                        lockMovementY: newLockState,
                        lockRotation: newLockState,
                        lockScalingX: newLockState,
                        lockScalingY: newLockState,
                        selectable: !newLockState,
                        evented: !newLockState, // 클릭 이벤트 비활성화
                        hoverCursor: newLockState ? 'default' : 'move',
                        moveCursor: newLockState ? 'default' : 'move'
                    });
                    
                    // UI 업데이트
                    this.textContent = newLockState ? '🔒' : '🔓';
                    fabricCanvas.renderAll();
                    saveCurrentCanvasState(); // 상태 저장
                });
            }
        });
    
        // 삭제 버튼 이벤트는 동일
        layerItem.querySelector('#layer_delete').addEventListener('click', function() {
            if (confirm('이 레이어를 삭제하시겠습니까?')) {
                if (window.historyManager) {
                    window.historyManager.recordState(() => {
                        // 캔버스에서 객체 삭제
                        fabricCanvas.remove(layer.fabricObject);
                        // UI 레이어 요소 삭제
                        layerItem.remove();
                        
                        // 레이어 배열 인스턴스에서 삭제
                        const index = layerInstances[currentView].findIndex(l => l === layer);
                        if (index > -1) {
                            layerInstances[currentView].splice(index, 1);
                }
                // 레이어 인덱스 업데이트
                        updateLayerIndices();
                    });
                }
            }
        });
    }

    // 레이어 패널 업데이트 함수 추가
    window.updateLayerPanel = function(view) {
        const layerContent = document.querySelector('#layer-content');
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
