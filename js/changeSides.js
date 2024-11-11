// 각 면의 캔버스 상태를 저장할 객체
let canvasStates = {
    'outer-front': null,
    'outer-back': null,
    'inner-front': null,
    'inner-back': null
};

let currentView = 'outer-front';
let fabricCanvas = null;

// DOM이 로드된 후 실행
function initChangeSides(canvas) {
    this.fabricCanvas = canvas; // canvas2.js에서 생성한 fabricCanvas 참조
    
    // 뷰 버튼 이벤트 리스너 추가
    const viewButtons = document.querySelectorAll('.bracelet-view-buttons .btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.dataset.view;
            
            // 현재 캔버스 상태 저장
            if (fabricCanvas) {
                canvasStates[currentView] = fabricCanvas.toJSON();
            }
            
            // 버튼 활성화 상태 변경
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 이미지 변경
            const braceletImage = document.getElementById('braceletImage');
            if (braceletImage) {
                if (view.startsWith('inner')) {
                    braceletImage.src = 'images/braceletInner.svg';
                } else {
                    braceletImage.src = 'images/bracelet.svg';
                }
                
                // 이미지 로드 완료 후 캔버스 크기 조정
                braceletImage.onload = function() {
                    updateCanvasSize();
                };
            }
            
            // 캔버스 초기화
            if (fabricCanvas) {
                fabricCanvas.clear();
                
                // 저장된 상태가 있으면 복원
                if (canvasStates[view]) {
                    fabricCanvas.loadFromJSON(canvasStates[view], function() {
                        fabricCanvas.renderAll();
                    });
                }
            }
            
            currentView = view;
        });
    });
}

// 캔버스 크기 조정 함수
function updateCanvasSize() {
    const braceletImage = document.getElementById('braceletImage');
    const printableArea = document.querySelector('.printable-area');
    const canvas = document.getElementById('activeCanvas');
    
    if (braceletImage && canvas && fabricCanvas) {
        // 팔찌 이미지 크기에 맞춰 캔버스 크기 조정
        canvas.width = braceletImage.width * 0.6;
        canvas.height = braceletImage.height * 0.4;
        
        // fabricCanvas 크기도 함께 조정
        fabricCanvas.setDimensions({
            width: canvas.width,
            height: canvas.height
        });
        
        // 저장된 상태가 있으면 복원
        if (canvasStates[currentView]) {
            fabricCanvas.loadFromJSON(canvasStates[currentView], function() {
                fabricCanvas.renderAll();
            });
        }
    }
}

// 외부에서 접근할 수 있도록 export
window.initChangeSides = initChangeSides;