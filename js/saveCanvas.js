// 지금은 클라이언트한테 저장되는 로직, 서버에 저장되는 거롤 바껴야함
/**
 * canavs안의 내용만 svg로 저장
 */
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
/**
 * 사용자 화면 뷰 전환해가며 팔찌 이미지 png저장
 */
// document.addEventListener('DOMContentLoaded', function() {
//     async function exportBraceletToPNG() {
//         const views = Object.keys(canvasInstances);
//         // 현재 상태 백업
//         const originalView = currentView;
        
//         // 임시 캔버스 생성
//         const tempCanvas = new fabric.Canvas(document.createElement('canvas'));
//         tempCanvas.setDimensions({
//             width: fabricCanvas.width,
//             height: fabricCanvas.height
//         });

//         for (const view of views) {
//             try {
//                 // 임시 캔버스에 상태 로드
//                 const viewState = canvasInstances[view].toJSON();
//                 await new Promise(resolve => {
//                     tempCanvas.loadFromJSON(viewState, function() {
//                         tempCanvas.renderAll();
//                         resolve();
//                     });
//                 });

//                 // 임시 div 생성 및 설정
//                 const tempDiv = document.createElement('div');
//                 tempDiv.style.position = 'absolute';
//                 tempDiv.style.left = '-9999px';
//                 tempDiv.style.top = '-9999px';
//                 document.body.appendChild(tempDiv);

//                 // 원본 bracelet div의 내용을 복사
//                 const originalBracelet = document.getElementById('bracelet');
//                 tempDiv.innerHTML = originalBracelet.innerHTML;

//                 // SVG 업데이트
//                 const tempSvg = tempDiv.querySelector('#braceletSVG');
//                 if (tempSvg) {
//                     // SVG 내용 업데이트 로직
//                 }

//                 // 이미지 캡처
//                 const canvas = await html2canvas(tempDiv, {
//                     scale: 2,
//                     backgroundColor: null,
//                     logging: false,
//                     useCORS: true,
//                     allowTaint: true
//                 });

//                 // PNG로 저장
//                 const link = document.createElement('a');
//                 link.download = `bracelet-design-${view}.png`;
//                 link.href = canvas.toDataURL('image/png');
//                 link.click();

//                 // 임시 요소 제거
//                 document.body.removeChild(tempDiv);
                
//             } catch (error) {
//                 console.error(`Error saving ${view} view:`, error);
//             }
//         }

//         // 임시 캔버스 제거
//         tempCanvas.dispose();
//     }

//     // 저장 버튼에 이벤트 리스너 추가
//     const saveButton = document.getElementById('saveButton');
//     if (saveButton) {
//         saveButton.addEventListener('click', exportBraceletToPNG);
//     } else {
//         console.error('Save button not found in the document');
//     }
// });

// document.addEventListener('DOMContentLoaded', function() {
//     const saveButton = document.getElementById('saveButton');
    
//     saveButton.addEventListener('click', async function() {
//         // 현재 상태 저장
//         const currentViewButton = document.querySelector('#viewButtons button.active');
//         const originalView = currentViewButton.dataset.view;
        
//         // 각 뷰 순회하며 캡쳐
//         const views = ['outer-front', 'outer-back', 'inner-front', 'inner-back'];
        
//         for (const view of views) {
//             // 뷰 전환
//             const viewButton = document.querySelector(`#viewButtons button[data-view="${view}"]`);
//             viewButton.click();
            
//             // DOM이 업데이트될 때까지 대기
//             await new Promise(resolve => setTimeout(resolve, 500));
            
//             // 캡쳐 및 저장
//             const braceletDiv = document.getElementById('bracelet');
            
//             try {
//                 const canvas = await html2canvas(braceletDiv, {
//                     backgroundColor: null,  // 투명 배경
//                     scale: 2,  // 해상도 2배 증가
//                     useCORS: true,  // Cross-Origin 이미지 허용
//                     logging: false  // 디버그 로그 비활성화
//                 });
                
//                 // Canvas를 데이터 URL로 변환
//                 const dataUrl = canvas.toDataURL('image/png');
                
//                 // 다운로드 링크 생성 및 클릭
//                 const link = document.createElement('a');
//                 link.download = `bracelet-${view}.png`;
//                 link.href = dataUrl;
//                 link.click();
                
//             } catch (error) {
//                 console.error(`Error capturing ${view}:`, error);
//             }
//         }
        
//         // 원래 뷰로 복귀
//         document.querySelector(`#viewButtons button[data-view="${originalView}"]`).click();
        
//         alert('모든 뷰의 캡쳐가 완료되었습니다.');
//     });
// });
