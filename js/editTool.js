// Command 인터페이스와 공통 상태 관리
class CanvasCommand {
    constructor(canvas, state) {
        this.canvas = canvas;
        this.previousState = state;
        // 변경 후 상태는 execute() 실행 시 저장
        this.newState = null;
    }

    // 현재 캔버스의 전체 상태를 저장
    saveCanvasState() {
        return {
            canvasState: this.canvas.toJSON(['id', 'visible', 'lockMovementX', 
                'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 
                'selectable', 'evented', 'hoverCursor', 'moveCursor', 'objectType']),
            currentView: currentView,
            canvasInstances: Object.fromEntries(
                Object.entries(canvasInstances).map(([key, canvas]) => [
                    key,
                    canvas ? canvas.toJSON(['id', 'visible', 'lockMovementX', 
                        'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 
                        'selectable', 'evented', 'hoverCursor', 'moveCursor', 'objectType']) : null
                ])
            )
        };
    }

    // 저장된 상태로 캔버스 복원
    loadCanvasState(state) {
        if (!state) return;

        // 뷰 전환이 필요한 경우
        if (currentView !== state.currentView) {
            currentView = state.currentView;
            // UI 뷰 버튼 상태 업데이트
            const viewButtons = document.querySelectorAll('#viewButtons button');
            viewButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === currentView);
            });
        }

        // 현재 캔버스 상태 복원
        this.canvas.loadFromJSON(state.canvasState, () => {
            // 객체별 추가 속성 복원
            this.canvas.getObjects().forEach(obj => {
                if (obj.lockMovementX) {
                    obj.set({
                        selectable: false,
                        evented: false,
                        hoverCursor: 'default',
                        moveCursor: 'default'
                    });
                }
            });
            this.canvas.renderAll();
        });

        // 다른 뷰의 캔버스 상태 복원
        Object.entries(state.canvasInstances).forEach(([view, instanceState]) => {
            if (instanceState) {
                if (!canvasInstances[view]) {
                    canvasInstances[view] = new fabric.Canvas(null);
                }
                canvasInstances[view].loadFromJSON(instanceState, () => {
                    canvasInstances[view].getObjects().forEach(obj => {
                        if (obj.lockMovementX) {
                            obj.set({
                                selectable: false,
                                evented: false,
                                hoverCursor: 'default',
                                moveCursor: 'default'
                            });
                        }
                    });
                });
            }
        });

        // 레이어 패널 업데이트
        rebuildLayerPanel();
    }

    execute() {
        throw new Error('execute method must be implemented');
    }

    undo() {
        this.loadCanvasState(this.previousState);
    }

    redo() {
        this.loadCanvasState(this.newState);
    }
}

// 상태 변경 Command 클래스
class StateChangeCommand extends CanvasCommand {
    constructor(canvas, callback) {
        super(canvas, null);
        this.callback = callback;
        this.previousState = this.saveCanvasState();
    }

    execute() {
        this.callback();
        this.newState = this.saveCanvasState();
    }
}

// 히스토리 관리자 클래스
class HistoryManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.undoStack = [];
        this.redoStack = [];
        this.isExecutingCommand = false;

        // 캔버스 이벤트 리스너 설정
        this.setupCanvasListeners();
        // 버튼 이벤트 리스너 설정
        this.setupButtonListeners();
    }

    // 캔버스 이벤트 리스너 설정
    setupCanvasListeners() {
        let initialState = null;

        // 객체 수정 시작 시 초기 상태 저장
        this.canvas.on('mouse:down', (e) => {
            if (e.target && !this.isExecutingCommand) {
                initialState = this.createStateSnapshot();
            }
        });

        // 객체 수정 완료 시 Command 생성 및 실행
        this.canvas.on('mouse:up', () => {
            if (initialState && !this.isExecutingCommand) {
                const finalState = this.createStateSnapshot();
                if (this.hasStateChanged(initialState, finalState)) {
                    this.executeCommand(new StateChangeCommand(this.canvas, () => {
                        this.loadStateSnapshot(finalState);
                    }));
                }
                initialState = null;
            }
        });

        // 객체 속성 변경 감지
        this.canvas.on('object:modified', (e) => {
            if (!this.isExecutingCommand) {
                this.executeCommand(new StateChangeCommand(this.canvas, () => {}));
            }
        });
    }

    // 버튼 이벤트 리스너 설정
    setupButtonListeners() {
        // Undo 버튼
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });

        // Redo 버튼
        document.getElementById('redoBtn').addEventListener('click', () => {
            this.redo();
        });
    }

    // Command 실행
    executeCommand(command) {
        this.isExecutingCommand = true;
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
        this.isExecutingCommand = false;
        this.updateButtonStates();
    }

    // Undo 실행
    undo() {
        if (this.undoStack.length > 0) {
            const command = this.undoStack.pop();
            this.isExecutingCommand = true;
            command.undo();
            this.redoStack.push(command);
            this.isExecutingCommand = false;
            this.updateButtonStates();
        }
    }

    // Redo 실행
    redo() {
        if (this.redoStack.length > 0) {
            const command = this.redoStack.pop();
            this.isExecutingCommand = true;
            command.redo();
            this.undoStack.push(command);
            this.isExecutingCommand = false;
            this.updateButtonStates();
        }
    }

    // 현재 상태 스냅샷 생성
    createStateSnapshot() {
        return {
            canvasState: this.canvas.toJSON(['id', 'visible', 'lockMovementX', 
                'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 
                'selectable', 'evented', 'hoverCursor', 'moveCursor', 'objectType']),
            currentView: currentView,
            svgSrc: braceletImage.src,
            canvasInstances: Object.fromEntries(
                Object.entries(canvasInstances).map(([key, canvas]) => [
                    key,
                    canvas ? canvas.toJSON(['id', 'visible', 'lockMovementX', 
                        'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 
                        'selectable', 'evented', 'hoverCursor', 'moveCursor', 'objectType']) : null
                ])
            )
        };
    }

    // 상태 스냅샷 로드
    loadStateSnapshot(state) {
        if (!state) return;
        
        if (currentView !== state.currentView) {
            // 뷰 버튼 상태 업데이트
            const viewButtons = document.querySelectorAll('#viewButtons button');
            viewButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === state.currentView);
            });

            // SVG 이미지 업데이트
            if (braceletImage.src !== state.svgSrc) {
                changeSVGImage(state.svgSrc);
            }

            currentView = state.currentView;
        }

        // 캔버스 상태 복원
        this.canvas.loadFromJSON(state.canvasState, () => {
            this.canvas.renderAll();
            // 레이어 패널 동기화
            syncLayerPanelWithCanvas();
        });

        // 다른 뷰의 캔버스 상태 복원
        Object.entries(state.canvasInstances).forEach(([view, instanceState]) => {
            if (instanceState && canvasInstances[view]) {
                canvasInstances[view].loadFromJSON(instanceState, () => {});
            }
        });
    }

    // 상태 변경 여부 확인
    hasStateChanged(state1, state2) {
        return JSON.stringify(state1) !== JSON.stringify(state2);
    }

    // 버튼 상태 업데이트
    updateButtonStates() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) {
            undoBtn.disabled = this.undoStack.length === 0;
        }
        if (redoBtn) {
            redoBtn.disabled = this.redoStack.length === 0;
        }
    }

    // 외부에서 상태 변경을 기록하기 위한 메서드
    recordState(callback) {
        if (!this.isExecutingCommand) {
            this.executeCommand(new StateChangeCommand(this.canvas, callback));
        }
    }
}


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



// Canvas 이벤트 리스너 설정 함수
function setupCanvasListeners() {
    fabricCanvas.on('selection:created', updateButtonStates);
    fabricCanvas.on('selection:updated', updateButtonStates);
    fabricCanvas.on('selection:cleared', updateButtonStates);
}



// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 히스토리 매니저 초기화
    window.historyManager = new HistoryManager(fabricCanvas);
    
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
        }
    });
});


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