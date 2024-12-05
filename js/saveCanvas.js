document.addEventListener('DOMContentLoaded', function() {
    // Canvas 상태를 SVG로 저장하는 함수
    function exportCanvasToSVG() {
        // 각 면의 상태를 SVG로 저장
        Object.keys(canvasInstances).forEach(view => {
            // 현재 상태 저장을 위해 임시로 view 전환
            const previousView = currentView;
            currentView = view;
            
            // 해당 면의 캔버스 상태 로드
            fabricCanvas.clear();
            fabricCanvas.loadFromJSON(canvasInstances[view].toJSON(), function() {
                // Canvas를 SVG로 변환
                const svgData = fabricCanvas.toSVG();
                
                // SVG 파일로 저장
                const blob = new Blob([svgData], {type: 'image/svg+xml'});
                const url = URL.createObjectURL(blob);
                
                // 다운로드 링크 생성
                const link = document.createElement('a');
                link.href = url;
                link.download = `bracelet-design-${view}.svg`;
                link.click();
                
                // URL 객체 해제
                URL.revokeObjectURL(url);
            });
            
            // 이전 view로 복원
            currentView = previousView;
            loadCanvasState();
        });
    }

    // 저장 버튼 요소 가져오기
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', exportCanvasToSVG);
    } else {
        console.error('Save button not found in the document');
    }
});