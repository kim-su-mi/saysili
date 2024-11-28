// 버든 버튼을 비활성화하는 함수
function disableAllButtons() {
    const buttons = document.querySelectorAll('.right_panel_div button');
    buttons.forEach(button => {
        // 실행취소, 다시실행, 처음부터 버튼은 제외
        if (!['undoBtn', 'redoBtn', 'resetBtn'].includes(button.id)) {
            button.disabled = true;
        }
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
        } else if (activeObject.objectType === 'group' ) {
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
// Stack for undo/redo operations
const undoStack = [];
const redoStack = [];

// Save canvas state with view information
function saveCanvasState() {
    // 새로운 작업이 발생하면 redo 스택 초기화
    // redoStack.length = 0;
    
    const state = {
        json: fabricCanvas.toJSON(['id', 'objectType', 'originalLayerNames', 'visible', 
            'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 
            'lockScalingY', 'selectable', 'evented', 'hoverCursor', 'moveCursor']),
        viewMode: currentView,
        layers: layerInstances[currentView].map(layer => ({
            id: layer.fabricObject.id,
            type: layer.fabricObject.objectType || layer.fabricObject.type
        }))
    };
    
    console.log('Saving New State:');
    console.log('New State:', state);
    console.log('undoStack length before save:', undoStack.length);
    
    undoStack.push(JSON.stringify(state));
    // updateUndoRedoButtons();
}

// Load canvas state from saved state
function loadCanvasState(jsonState) {
    const state = JSON.parse(jsonState);
    console.log('Loading State:', state);
    
    if (currentView !== state.viewMode) {
        currentView = state.viewMode;
    }
    
    // 캔버스와 레이어 패널 초기화
    fabricCanvas.clear();
    const layerContent = document.querySelector('#layer-content');
    layerContent.innerHTML = '';
    layerInstances[currentView] = [];
    
    // 캔버스 상태 복원
    fabricCanvas.loadFromJSON(state.json, () => {
        // 모든 객체에 대해 레이어 재생성
        const objects = fabricCanvas.getObjects();
        console.log('Restored Objects:', objects);
        
        objects.forEach((obj, index) => {
            // 객체의 모든 속성이 복원되었는지 확인
            if (!obj.id) {
                obj.id = uuid.v4(); // ID가 없는 경우 새로 생성
            }
            
            const layer = createLayerItem(obj, index + 1);
            if (layer && layer.element) {
                layerContent.appendChild(layer.element);
            }
        });
        
        fabricCanvas.renderAll();
        updateButtonStates();
        updateLayerIndices();
        // updateUndoRedoButtons();
    });
}

// Update button states based on stack status
// function updateUndoRedoButtons() {
//     const undoBtn = document.getElementById('undoBtn');
//     const redoBtn = document.getElementById('redoBtn');
    
//     // 스택 상태에 따라 버튼 활성화/비활성화
//     if (undoBtn && redoBtn) {
//         undoBtn.disabled = undoStack.length <= 1;
//         redoBtn.disabled = redoStack.length === 0;
//     }
// }

// Undo function
function undo() {
    if (undoStack.length <= 1) return; // 초기 상태만 남았으면 실행 취소 불가
    
    // 현재 상태를 redoStack에 저장하고 undoStack에서 제거
    const currentState = undoStack.pop();
    redoStack.push(currentState);
    
    console.log('Undo Operation:');
    console.log('Current State moved to redoStack:', JSON.parse(currentState));
    console.log('redoStack length:', redoStack.length);
    console.log('undoStack length:', undoStack.length);
    
    // undoStack의 마지막 상태(이전 상태)를 로드
    const previousState = undoStack[undoStack.length - 1];
    if (previousState) {
        console.log('Loading Previous State:', JSON.parse(previousState));
        loadCanvasState(previousState);
    }
}

// Redo function
function redo() {
    if (redoStack.length === 0) {
        console.log('Redo스택 비어있음');
        return};
    
    // redoStack의 마지막 상태를 가져옴
    const nextState = redoStack.pop();
    
    console.log('Redo Operation:');
    console.log('Next State from redoStack:', JSON.parse(nextState));
    console.log('redoStack length:', redoStack.length);
    console.log('undoStack length:', undoStack.length);
    
    // 현재 상태를 undoStack에 저장하고 다음 상태를 로드
    if (nextState) {
        undoStack.push(nextState);
        loadCanvasState(nextState);
    }
}

// Canvas 이벤트 리스너 설정 함수
function setupCanvasListeners() {
    fabricCanvas.on('selection:created', updateButtonStates);
    fabricCanvas.on('selection:updated', updateButtonStates);
    fabricCanvas.on('selection:cleared', updateButtonStates);
    
    // 객체 수정 관련 이벤트에 상태 저장 추가
    fabricCanvas.on('object:modified', () => {
        saveCanvasState();
    });
    
    fabricCanvas.on('object:added', () => {
        saveCanvasState();
    });
    
    fabricCanvas.on('object:removed', () => {
        saveCanvasState();
    });
    
    // 초기 상태 저장
    saveCanvasState();
    
    // 실행 취소/다시실행 버튼 이벤트 리스너
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
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
            saveCanvasState(); // 추가
        }
    });

    // 가로 중앙 정렬
    document.getElementById('horizontal_centerBtn').addEventListener('click', function() {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            activeObject.centerH();
            fabricCanvas.renderAll();
            saveCanvasState(); // 추가
        }
    });

    // 좌우 반전
    document.getElementById('horizontal_mirrorBtn').addEventListener('click', function() {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            activeObject.set('flipX', !activeObject.flipX);
            fabricCanvas.renderAll();
            saveCanvasState(); 
        }
    });

    // 상하 반전
    document.getElementById('vertical_mirrorBtn').addEventListener('click', function() {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            activeObject.set('flipY', !activeObject.flipY);
            fabricCanvas.renderAll();
            saveCanvasState(); 
        }
    });

    // 삭제 버튼
    document.getElementById('removeBtn').addEventListener('click', function() {
        // canvas에 선택된 객체 가져옴
        const activeObject = fabricCanvas.getActiveObject();
        // 선택된 객체가 있고 사용자가 예를 클릭했을 때 동작
        if (activeObject && confirm('선택한 객체를 삭제하시겠습니까?')) {
            //여러 객체(activeSelection)가 선택된 경우: getObjects()로 선택된 모든 객체의 배열을 가져옴 / 단일 객체인 경우: 해당 객체를 배열로 감싸서 처리
            const objectsToRemove = activeObject.type === 'activeSelection' 
                ? activeObject.getObjects() 
                : [activeObject];

            objectsToRemove.forEach(obj => {
                // 캔버스에서 객체 삭제
                fabricCanvas.remove(obj);
                // 레이어 패널에서 해당 객체의 레이어 찾기
                const layerToRemove = layerInstances[currentView].find(layer => 
                    layer.fabricObject && layer.fabricObject.id === obj.id
                );
                // 레이어 패널에서 삭제
                if (layerToRemove) {
                    const layerIndex = layerInstances[currentView].indexOf(layerToRemove);
                    if (layerIndex > -1) {
                        layerInstances[currentView].splice(layerIndex, 1);
                        if (layerToRemove.element) {
                            layerToRemove.element.remove();
                        }
                    }
                }
            });
            
            // 레이어 인덱스 업데이트
            updateLayerIndices();
            // 캔버스 다시 그리기
            fabricCanvas.renderAll();
            
            // 버튼 상태 업데이트
            updateButtonStates();
            saveCanvasState(); 
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
                    left: cloned.left + 5,
                    top: cloned.top + 5,
                    id: uuid.v4() // 새로운 고유 ID 부여
                });
                
                // 캔버스에 추가
                fabricCanvas.add(cloned);
                fabricCanvas.setActiveObject(cloned);
                
                // 레이어 생성 및 추가
                const layerContent = document.querySelector('#layer-content');
                const newLayer = createLayerItem(cloned, layerInstances[currentView].length + 1);
                if (newLayer && newLayer.element) {
                    layerContent.appendChild(newLayer.element);
                }
                
                // 캔버스 다시 그리기
                fabricCanvas.renderAll();
                saveCanvasState(); 
            });
        }
    });

    // 그룹화 버튼
    document.getElementById('groupBtn').addEventListener('click', function() {
        const activeSelection = fabricCanvas.getActiveObject();
        if (activeSelection && activeSelection.type === 'activeSelection') {
            // 선택된 객체들의 레이어 찾기 (z-index 순서대로)
            const selectedLayers = layerInstances[currentView].filter(layer => 
                activeSelection.getObjects().find(obj => obj.id === layer.fabricObject.id)
            );
            
            // 선택된 객체들의 원래 레이어 이름 저장
            const originalLayerNames = selectedLayers.map(layer => {
                const layerNameEl = layer.element.querySelector('.layer_title');
                return layerNameEl.textContent.split(' ')[0]; // "Template", "Text" 등의 원래 이름 저장
            });

            // 선택된 객체들을 그룹화
            const group = activeSelection.toGroup();
            group.set({
                id: uuid.v4(),
                objectType: 'group',
                originalLayerNames: originalLayerNames // 원래 레이어 이름들 저장
            });

            // 먼저 모든 선택된 레이어를 layerInstances에서 제거
            selectedLayers.forEach(layer => {
                const index = layerInstances[currentView].indexOf(layer);
                if (index > -1) {
                    layerInstances[currentView].splice(index, 1);
                    layer.element.remove();
                }
            });

            // 새로운 그룹 레이어 생성
            const layerContent = document.querySelector('#layer-content');
            const groupLayer = createLayerItem(group, 1);
            if (groupLayer && groupLayer.element) {
                const layerNameEl = groupLayer.element.querySelector('.layer_title');
                layerNameEl.textContent = `Group ${layerInstances[currentView].length}`;
                layerContent.appendChild(groupLayer.element);
            }
            
            fabricCanvas.renderAll();
            updateLayerIndices();
            saveCanvasState(); 
        }
    });

    // 그룹 해제 버튼
    document.getElementById('ungroupBtn').addEventListener('click', function() {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject && activeObject.type === 'group') {
            const items = activeObject.getObjects();
            const originalLayerNames = activeObject.originalLayerNames || [];

            console.log('그룹 해제 시 원래 레이어 이름:', originalLayerNames); // 로그 추가
            
            // 그룹 해제
            activeObject.destroy();
            fabricCanvas.remove(activeObject);
            
            // 기존 그룹 레이어 찾기
            const groupLayer = layerInstances[currentView].find(layer => 
                layer.fabricObject.id === activeObject.id
            );
            
            // 그룹 레이어 제거
            if (groupLayer) {
                const index = layerInstances[currentView].indexOf(groupLayer);
                if (index > -1) {
                    layerInstances[currentView].splice(index, 1);
                    groupLayer.element.remove();
                }
            }
            
            // 개별 객체들을 캔버스에 추가하고 레이어 생성
            items.forEach((item, index) => {
                item.set('id', uuid.v4());
                fabricCanvas.add(item);
                
                const layerContent = document.querySelector('#layer-content');
                const newLayer = createLayerItem(item, layerInstances[currentView].length + 1);
                if (newLayer && newLayer.element) {
                    const layerNameEl = newLayer.element.querySelector('.layer_title');
                    // 1. 먼저 원래 저장된 이름이 있는지 확인
                    const originalName = originalLayerNames[index];
                    if (originalName) {
                        // 2. 원래 이름이 있으면 그것을 사용
                        layerNameEl.textContent = `${originalName} ${layerInstances[currentView].length}`;
                    } else {
                        // 3. 원래 이름이 없으면 objectType을 사용,objectType이 없으면 'Layer' 사용
                        const objectType = item.objectType || 'Layer';
                        layerNameEl.textContent = `${objectType} ${layerInstances[currentView].length}`;
                    }
                    layerContent.appendChild(newLayer.element);
                }
            });
            
            fabricCanvas.renderAll();
            updateLayerIndices();
            saveCanvasState(); 
        }
    });
});

// 실행 취소/다시실행 버튼 상태 업데이트
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    // undoStack이 초기 상태만 있으면(길이가 1) 실행취소 불가능
    undoBtn.disabled = undoStack.length <= 1;
    // redoStack이 비어있으면 다시실행 불가능
    redoBtn.disabled = redoStack.length === 0;
}

// 레이어 패널 재구성 함수 추가
function rebuildLayerPanel() {
    const layerContent = document.querySelector('#layer-content');
    layerContent.innerHTML = '';
    layerInstances[currentView] = [];
    
    fabricCanvas.getObjects().forEach((obj, index) => {
        const layer = createLayerItem(obj, index + 1);
        if (layer && layer.element) {
            layerContent.appendChild(layer.element);
        }
    });
    
    updateLayerIndices();
}