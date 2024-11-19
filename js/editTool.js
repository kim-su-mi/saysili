// 전역 변수
let undoStack = [];
let redoStack = [];

// 실행 취소/다시 실행 관리를 위한 클래스
class UndoRedoHistory {
    constructor(canvas) {
        this.canvas = canvas;
        this._initialize();
    }

    _initialize() {
        this.canvas.on('object:added', () => {
            this._save();
        });

        this.canvas.on('object:modified', () => {
            this._save();
        });

        this.canvas.on('object:removed', () => {
            this._save();
        });

        // 초기 상태 저장
        this._save();
    }

    _save() {
        // 현재 상태를 JSON으로 저장
        const state = {
            view: currentView,
            canvasState: this.canvas.toJSON(['id']), // id 속성도 함께 저장
            instances: {}
        };

        // 다른 뷰들의 상태도 저장
        Object.keys(canvasInstances).forEach(view => {
            if (canvasInstances[view]) {
                state.instances[view] = canvasInstances[view].toJSON(['id']);
            }
        });

        // 상태 저장
        if (!this._state) {
            this._state = [];
            this._redoState = [];
        }

        // 현재 인덱스 이후의 상태는 제거
        this._state = this._state.slice(0, this._index + 1);
        this._state.push(state);
        this._index = this._state.length - 1;

        // Redo 스택 초기화
        this._redoState = [];
    }

    undo() {
        if (this._index > 0) {
            this._index--;
            const previousState = this._state[this._index];

            // 뷰 전환이 필요한 경우
            if (previousState.view !== currentView) {
                const viewButton = document.querySelector(`#viewButtons button[data-view="${previousState.view}"]`);
                if (viewButton) {
                    viewButton.click();
                }
            }

            // 모든 캔버스 인스턴스 복원
            Object.keys(previousState.instances).forEach(view => {
                if (canvasInstances[view]) {
                    canvasInstances[view].loadFromJSON(previousState.instances[view]);
                }
            });

            // 현재 캔버스 상태 복원
            this.canvas.loadFromJSON(previousState.canvasState, () => {
                this.canvas.renderAll();
            });

            return true;
        }
        return false;
    }

    redo() {
        if (this._index < this._state.length - 1) {
            this._index++;
            const nextState = this._state[this._index];

            // 뷰 전환이 필요한 경우
            if (nextState.view !== currentView) {
                const viewButton = document.querySelector(`#viewButtons button[data-view="${nextState.view}"]`);
                if (viewButton) {
                    viewButton.click();
                }
            }

            // 모든 캔버스 인스턴스 복원
            Object.keys(nextState.instances).forEach(view => {
                if (canvasInstances[view]) {
                    canvasInstances[view].loadFromJSON(nextState.instances[view]);
                }
            });

            // 현재 캔버스 상태 복원
            this.canvas.loadFromJSON(nextState.canvasState, () => {
                this.canvas.renderAll();
            });

            return true;
        }
        return false;
    }

    // 레이어에서 객체 삭제 시 호출되는 메서드
    removeObjectFromHistory(objectId) {
        // 모든 상태에서 해당 객체 제거
        this._state = this._state.map(state => {
            // 현재 캔버스 상태에서 객체 제거
            const objects = state.canvasState.objects.filter(obj => obj.id !== objectId);
            state.canvasState.objects = objects;

            // 다른 뷰의 상태에서도 객체 제거
            Object.keys(state.instances).forEach(view => {
                if (state.instances[view].objects) {
                    state.instances[view].objects = state.instances[view].objects.filter(obj => obj.id !== objectId);
                }
            });

            return state;
        });

        // 현재 상태 저장
        this._save();
    }
}

// 초기화 및 사용
document.addEventListener('DOMContentLoaded', function() {
    // fabricCanvas 초기화 후
    const history = new UndoRedoHistory(fabricCanvas);

    // 버튼 이벤트 리스너
    document.getElementById('undoBtn').addEventListener('click', () => {
        history.undo();
    });

    document.getElementById('redoBtn').addEventListener('click', () => {
        history.redo();
    });

    // 레이어에서 객체 삭제 시
    function onLayerObjectRemoved(objectId) {
        history.removeObjectFromHistory(objectId);
    }
});