// 지금은 클라이언트한테 저장되는 로직, 서버에 저장되는 거롤 바껴야함

document.addEventListener('DOMContentLoaded', function() {
    // Canvas 상태를 SVG로 저장하는 함수
    function exportCanvasToSVG() {
        const views = Object.keys(canvasInstances);
        // 현재 상태 백업
        const originalView = currentView;
        const originalState = JSON.stringify(canvasInstances[currentView].toJSON());
        
        let promise = Promise.resolve();

        views.forEach(view => {
            promise = promise.then(() => {
                return new Promise((resolve) => {
                    currentView = view;
                    const viewState = canvasInstances[view].toJSON();
                    
                    fabricCanvas.clear();
                    fabricCanvas.loadFromJSON(viewState, function() {
                        const svgData = fabricCanvas.toSVG();
                        const blob = new Blob([svgData], {type: 'image/svg+xml'});
                        const url = URL.createObjectURL(blob);
                        
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `bracelet-design-${view}.svg`;
                        link.click();
                        
                        URL.revokeObjectURL(url);
                        resolve();
                    });
                });
            });
        });

        // 모든 저장이 완료된 후 원래 상태로 복원
        promise.then(() => {
            currentView = originalView;
            fabricCanvas.clear();
            fabricCanvas.loadFromJSON(JSON.parse(originalState), function() {
                fabricCanvas.renderAll();
            });
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