// 버든 버튼을 비활성화하는 함수
function disableAllButtons() {
    const buttons = document.querySelectorAll('.right_panel_div button');
    buttons.forEach(button => {
        button.disabled = true;
    });
}

// 버튼 활성화/비활성화 관리
function updateButtonStates() {
    const activeObject = fabricCanvas.getActiveObject();
    
    // 기본적으로 모든 버튼 비활성화
    disableAllButtons();

    // 선택된 객체가 있을 경우
    if (activeObject) {
        // 기본 버튼들 활성화(그룹화 관련 버튼 제외)
        const buttons = document.querySelectorAll('.right_panel_div button');
        buttons.forEach(button => {
            if (!['groupBtn', 'ungroupBtn'].includes(button.id)) {
                button.disabled = false;
            }
        });

        // 그룹 관련 버튼 상태 관리
        const groupBtn = document.getElementById('groupBtn');
        const ungroupBtn = document.getElementById('ungroupBtn');
        
        // 여러객체가 선택된 경우
        if (fabricCanvas.getActiveObjects().length > 1) {
            groupBtn.disabled = false;
            ungroupBtn.disabled = true;
        } else if (activeObject.type === 'group' ) {
            // 템플릿이 아닌 그룹 객체인 경우에만 그룹 해제 버튼 활성화
            groupBtn.disabled = true;
            ungroupBtn.disabled = false;
        } 
        // else { // 단일 객체가 선택된 경우
        //     groupBtn.disabled = true;
        //     ungroupBtn.disabled = true;
        // }
    }
}

// Canvas 이벤트 리스너 설정 함수
function setupCanvasListeners() {
    fabricCanvas.on('selection:created', updateButtonStates); // 객체가 선택될 때
    fabricCanvas.on('selection:updated', updateButtonStates); // 선택된 객체가 변경될 때
    fabricCanvas.on('selection:cleared', updateButtonStates); // 선택이 해제될 때
}

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 초기 버튼 상태 설정
    disableAllButtons();
    
    // Canvas 이벤트 리스너 설정
    setupCanvasListeners();

    // 세로 중앙 정렬
    document.getElementById('vertical_centerBtn').addEventListener('click', function() {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            activeObject.centerV();
            fabricCanvas.renderAll();
        }
    });

    // 가로 중앙 정렬
    document.getElementById('horizontal_centerBtn').addEventListener('click', function() {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            activeObject.centerH();
            fabricCanvas.renderAll();
        }
    });

    // 좌우 반전
    document.getElementById('horizontal_mirrorBtn').addEventListener('click', function() {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            activeObject.set('flipX', !activeObject.flipX);
            fabricCanvas.renderAll();
        }
    });

    // 상하 반전
    document.getElementById('vertical_mirrorBtn').addEventListener('click', function() {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            activeObject.set('flipY', !activeObject.flipY);
            fabricCanvas.renderAll();
        }
    });

    // 삭제 버튼
    document.getElementById('removeBtn').addEventListener('click', function() {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject && confirm('선택한 객체를 삭제하시겠습니까?')) {
            // 캔버스에서 객체 삭제
            fabricCanvas.remove(activeObject);
            
            // 레이어 패널에서 해당 객체의 레이어 아이템 찾기
            const layerItem = document.querySelector(`.layer-item[data-object-id="${activeObject.id}"]`);
            if (layerItem) {
                // 레이어 배열에서 해당 레이어 찾기
                const layerIndex = layerInstances[currentView].findIndex(layer => 
                    layer.fabricObject && layer.fabricObject.id === activeObject.id
                );
                
                if (layerIndex > -1) {
                    // 레이어 배열에서 제거
                    layerInstances[currentView].splice(layerIndex, 1);
                    // UI에서 레이어 아이템 제거
                    layerItem.remove();
                    // 레이어 인덱스 업데이트
                    updateLayerIndices();
                }
            }
            
            // 캔버스 다시 그리기
            fabricCanvas.renderAll();
            // 버튼 상태 업데이트
            updateButtonStates();
        }
    });

    // 복제 버튼
    document.getElementById('duplicateBtn').addEventListener('click', function() {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            // 객체 복제
            activeObject.clone(function(cloned) {
                // 복제된 객체의 위치를 약간 이동
                cloned.set({
                    left: cloned.left + 10,
                    top: cloned.top + 10,
                    id: uuid.v4() // 새로운 고유 ID 부여
                });
                
                // 캔버스에 추가
                fabricCanvas.add(cloned);
                fabricCanvas.setActiveObject(cloned);
                
                // 레이어 생성 및 추가
                const layerContent = document.querySelector('.layer-content');
                const newLayer = createLayerItem(cloned, layerInstances[currentView].length + 1);
                if (newLayer && newLayer.element) {
                    layerContent.appendChild(newLayer.element);
                }
                
                // 캔버스 다시 그리기
                fabricCanvas.renderAll();
            });
        }
    });
});
