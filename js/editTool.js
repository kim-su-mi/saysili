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
        } else if (activeObject.type === 'group') { // 그룹 객체가 선택된 경우
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
});
