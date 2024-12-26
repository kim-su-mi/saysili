// 지금은 클라이언트한테 저장되는 로직, 서버에 저장되는 거롤 바껴야함
/**
 * 여러개의 파일로 저장
 */
// document.addEventListener('DOMContentLoaded', function() {
//     // Canvas 상태를 SVG로 저장하는 함수
//     function exportCanvasToSVG() {
//         const views = Object.keys(canvasInstances);
//         // 현재 상태 백업
//         const originalView = currentView;
//         const originalState = JSON.stringify(canvasInstances[currentView].toJSON());
        
//         let promise = Promise.resolve();

//         views.forEach(view => {
//             promise = promise.then(() => {
//                 return new Promise((resolve) => {
//                     // 각 뷰로 전환하고 상태 로드
//                     currentView = view;
//                     const viewState = canvasInstances[view].toJSON();
                    
//                     fabricCanvas.clear();
//                     fabricCanvas.loadFromJSON(viewState, function() {
//                         // SVG 생성 및 저장
//                         const svgData = fabricCanvas.toSVG({
//                             viewBox: {
//                                 x: 0,
//                                 y: 0,
//                                 width: fabricCanvas.width,
//                                 height: fabricCanvas.height
//                             },
//                             width: fabricCanvas.width,
//                             height: fabricCanvas.height
//                         });
                        
//                         const blob = new Blob([svgData], {type: 'image/svg+xml'});
//                         const url = URL.createObjectURL(blob);
                        
//                         const link = document.createElement('a');
//                         link.href = url;
                        
//                         // 현재 날짜와 시간을 파일명에 포함
//                         const date = new Date();
//                         const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}`;
//                         link.download = `bracelet-design-${view}-${timestamp}.svg`;
                        
//                         link.click();
//                         URL.revokeObjectURL(url);
//                         resolve();
//                     });
//                 });
//             });
//         });

//         // 모든 저장이 완료된 후 원래 상태로 복원
//         promise.then(() => {
//             currentView = originalView;
//             fabricCanvas.clear();
//             fabricCanvas.loadFromJSON(JSON.parse(originalState), function() {
//                 fabricCanvas.renderAll();
//             });
//         });
//     }

//     // 저장 버튼 요소 가져오기
//     const saveButton = document.getElementById('saveButton');
//     if (saveButton) {
//         saveButton.addEventListener('click', exportCanvasToSVG);
//     } else {
//         console.error('Save button not found in the document');
//     }
// });

/* 하나의 파일로 저장 */
// document.addEventListener('DOMContentLoaded', function() {
//     async function exportAllViewsToSVG() {
//         const views = ['outer-front', 'outer-back', 'inner-front', 'inner-back'];
//         const originalView = currentView;
//         const originalState = JSON.stringify(canvasInstances[currentView].toJSON());
        
//         const svgContents = [];
//         const canvasHeight = fabricCanvas.height;
//         const canvasWidth = fabricCanvas.width;
        
//         for (const view of views) {
//             await new Promise(resolve => {
//                 currentView = view;
//                 const viewState = canvasInstances[view]?.toJSON();
                
//                 if (viewState) {
//                     fabricCanvas.clear();
//                     fabricCanvas.loadFromJSON(viewState, function() {
//                         let svgData = fabricCanvas.toSVG()
//                             .replace(/<\?xml[^>]*\?>/, '')
//                             .replace(/<!DOCTYPE[^>]*>/, '')
//                             .replace(/<svg[^>]*>/, '')
//                             .replace(/<\/svg>/, '')
//                             .replace(/<desc>Created with Fabric.js[^<]*<\/desc>/, '');
                        
//                         // defs 섹션 추출 및 정리
//                         const defsMatch = svgData.match(/<defs>([\s\S]*?)<\/defs>/);
//                         const defs = defsMatch ? defsMatch[1] : '';
//                         svgData = svgData.replace(/<defs>[\s\S]*?<\/defs>/, '');
                        
//                         svgContents.push({
//                             defs: defs,
//                             content: svgData.trim()
//                         });
//                         resolve();
//                     });
//                 } else {
//                     svgContents.push({
//                         defs: '',
//                         content: ''
//                     });
//                     resolve();
//                 }
//             });
//         }

//         // 모든 defs를 하나로 통합
//         const allDefs = svgContents.map(item => item.defs).join('\n');

//         const svgDocument = `<?xml version="1.0" encoding="UTF-8"?>
// <svg xmlns="http://www.w3.org/2000/svg" 
//      width="${canvasWidth}" 
//      height="${canvasHeight * views.length}" 
//      viewBox="0 0 ${canvasWidth} ${canvasHeight * views.length}">
//     <defs>
//         ${allDefs}
//     </defs>
//     ${svgContents.map((item, index) => `
//     <g transform="translate(0, ${index * canvasHeight})">
//         ${item.content}
//     </g>`).join('\n')}
// </svg>`;

//         const blob = new Blob([svgDocument], { type: 'image/svg+xml;charset=utf-8' });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
        
//         const date = new Date();
//         const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}`;
//         link.download = `bracelet_design_${timestamp}.svg`;
        
//         link.click();
//         URL.revokeObjectURL(url);

//         currentView = originalView;
//         fabricCanvas.clear();
//         fabricCanvas.loadFromJSON(JSON.parse(originalState), function() {
//             fabricCanvas.renderAll();
//         });
//     }

//     const saveButton = document.getElementById('saveButton');
//     if (saveButton) {
//         saveButton.addEventListener('click', exportAllViewsToSVG);
//     } else {
//         console.error('Save button not found in the document');
//     }
// });

// document.addEventListener('DOMContentLoaded', function() {
//     async function exportAllViewsToSVG() {
//         const views = ['outer-front', 'outer-back', 'inner-front', 'inner-back'];
//         const originalView = currentView;
//         const originalState = JSON.stringify(canvasInstances[currentView].toJSON());
        
//         const svgContents = [];
//         const canvasHeight = fabricCanvas.height;
//         const canvasWidth = fabricCanvas.width;
        
//         for (const view of views) {
//             await new Promise(resolve => {
//                 currentView = view;
//                 const viewState = canvasInstances[view]?.toJSON();
                
//                 if (viewState) {
//                     fabricCanvas.clear();
//                     fabricCanvas.loadFromJSON(viewState, function() {
//                         let svgData = fabricCanvas.toSVG({
//                             // SVG 옵션 추가
//                             suppressPreamble: true,
//                             viewBox: {
//                                 x: 0,
//                                 y: 0,
//                                 width: fabricCanvas.width,
//                                 height: fabricCanvas.height
//                             }
//                         })
//                             .replace(/<\?xml[^>]*\?>/, '')
//                             .replace(/<!DOCTYPE[^>]*>/, '')
//                             .replace(/<svg[^>]*>/, '')
//                             .replace(/<\/svg>/, '')
//                             .replace(/<desc>Created with Fabric.js[^<]*<\/desc>/, '');
                        
//                         // defs 섹션 추출 및 정리
//                         const defsMatch = svgData.match(/<defs>([\s\S]*?)<\/defs>/);
//                         const defs = defsMatch ? defsMatch[1] : '';
//                         svgData = svgData.replace(/<defs>[\s\S]*?<\/defs>/, '');
                        
//                         svgContents.push({
//                             defs: defs,
//                             content: svgData.trim()
//                         });
//                         resolve();
//                     });
//                 } else {
//                     svgContents.push({
//                         defs: '',
//                         content: ''
//                     });
//                     resolve();
//                 }
//             });
//         }

//         // 모든 defs를 하나로 통합
//         const allDefs = svgContents.map(item => item.defs).join('\n');

//         const svgDocument = `<?xml version="1.0" encoding="UTF-8"?>
// <svg xmlns="http://www.w3.org/2000/svg" 
//      xmlns:xlink="http://www.w3.org/1999/xlink"
//      width="${canvasWidth}" 
//      height="${canvasHeight * views.length}" 
//      viewBox="0 0 ${canvasWidth} ${canvasHeight * views.length}">
//     <defs>
//         ${allDefs}
//     </defs>
//     ${svgContents.map((item, index) => `
//     <g transform="translate(0, ${index * canvasHeight})">
//         ${item.content}
//     </g>`).join('\n')}
// </svg>`;

//         const blob = new Blob([svgDocument], { type: 'image/svg+xml;charset=utf-8' });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
        
//         const date = new Date();
//         const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}`;
//         link.download = `bracelet_design_${timestamp}.svg`;
        
//         link.click();
//         URL.revokeObjectURL(url);

//         currentView = originalView;
//         fabricCanvas.clear();
//         fabricCanvas.loadFromJSON(JSON.parse(originalState), function() {
//             fabricCanvas.renderAll();
//         });
//     }

//     const saveButton = document.getElementById('saveButton');
//     if (saveButton) {
//         saveButton.addEventListener('click', exportAllViewsToSVG);
//     } else {
//         console.error('Save button not found in the document');
//     }
// });

/* 빈캔버스만 뺴고 저장하는 코드 */
// document.addEventListener('DOMContentLoaded', function() {
//     async function exportAllViewsToSVG() {
//         const views = ['outer-front', 'outer-back', 'inner-front', 'inner-back'];
//         const originalView = currentView;
//         const originalState = JSON.stringify(canvasInstances[currentView].toJSON());
        
//         const svgContents = [];
//         const canvasHeight = fabricCanvas.height;
//         const canvasWidth = fabricCanvas.width;
        
//         for (const view of views) {
//             await new Promise(resolve => {
//                 currentView = view;
//                 const viewState = canvasInstances[view]?.toJSON();
                
//                 if (viewState) {
//                     fabricCanvas.clear();
//                     fabricCanvas.loadFromJSON(viewState, function() {
//                         let svgData = fabricCanvas.toSVG({
//                             // SVG 옵션 추가
//                             suppressPreamble: true,
//                             viewBox: {
//                                 x: 0,
//                                 y: 0,
//                                 width: fabricCanvas.width,
//                                 height: fabricCanvas.height
//                             }
//                         })
//                             .replace(/<\?xml[^>]*\?>/, '')
//                             .replace(/<!DOCTYPE[^>]*>/, '')
//                             .replace(/<svg[^>]*>/, '')
//                             .replace(/<\/svg>/, '')
//                             .replace(/<desc>Created with Fabric.js[^<]*<\/desc>/, '');
                        
//                         // defs 섹션 추출 및 정리
//                         const defsMatch = svgData.match(/<defs>([\s\S]*?)<\/defs>/);
//                         const defs = defsMatch ? defsMatch[1] : '';
//                         svgData = svgData.replace(/<defs>[\s\S]*?<\/defs>/, '');
                        
//                         svgContents.push({
//                             defs: defs,
//                             content: svgData.trim()
//                         });
//                         resolve();
//                     });
//                 } else {
//                     svgContents.push({
//                         defs: '',
//                         content: ''
//                     });
//                     resolve();
//                 }
//             });
//         }

//         // 모든 defs를 하나로 통합
//         const allDefs = svgContents.map(item => item.defs).join('\n');

//         const svgDocument = `<?xml version="1.0" encoding="UTF-8"?>
// <svg xmlns="http://www.w3.org/2000/svg" 
//      xmlns:xlink="http://www.w3.org/1999/xlink"
//      width="${canvasWidth}" 
//      height="${canvasHeight * views.length}" 
//      viewBox="0 0 ${canvasWidth} ${canvasHeight * views.length}">
//     <defs>
//         ${allDefs}
//     </defs>
//     ${svgContents.map((item, index) => `
//     <g transform="translate(0, ${index * canvasHeight})">
//         ${item.content}
//     </g>`).join('\n')}
// </svg>`;

//         const blob = new Blob([svgDocument], { type: 'image/svg+xml;charset=utf-8' });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
        
//         const date = new Date();
//         const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}`;
//         link.download = `bracelet_design_${timestamp}.svg`;
        
//         link.click();
//         URL.revokeObjectURL(url);

//         currentView = originalView;
//         fabricCanvas.clear();
//         fabricCanvas.loadFromJSON(JSON.parse(originalState), function() {
//             fabricCanvas.renderAll();
//         });
//     }

//     const saveButton = document.getElementById('saveButton');
//     if (saveButton) {
//         saveButton.addEventListener('click', exportAllViewsToSVG);
//     } else {
//         console.error('Save button not found in the document');
//     }
// });

// document.addEventListener('DOMContentLoaded', function() {
//     async function exportAllViewsToSVG() {
//         const views = ['outer-front', 'outer-back', 'inner-front', 'inner-back'];
//         const originalView = currentView;
//         const originalState = JSON.stringify(canvasInstances[currentView].toJSON());
        
//         const svgContents = [];
//         const canvasHeight = fabricCanvas.height;
//         const canvasWidth = fabricCanvas.width;
        
//         for (const view of views) {
//             await new Promise(resolve => {
//                 currentView = view;
//                 const viewState = canvasInstances[view]?.toJSON();
                
//                 fabricCanvas.clear();
//                 fabricCanvas.loadFromJSON(viewState, function() {
//                     let svgData = fabricCanvas.toSVG({
//                         suppressPreamble: true,
//                         viewBox: {
//                             x: 0,
//                             y: 0,
//                             width: fabricCanvas.width,
//                             height: fabricCanvas.height
//                         }
//                     })
//                         .replace(/<\?xml[^>]*\?>/, '')
//                         .replace(/<!DOCTYPE[^>]*>/, '')
//                         .replace(/<svg[^>]*>/, '')
//                         .replace(/<\/svg>/, '')
//                         .replace(/<desc>Created with Fabric.js[^<]*<\/desc>/, '');
                    
//                     const defsMatch = svgData.match(/<defs>([\s\S]*?)<\/defs>/);
//                     const defs = defsMatch ? defsMatch[1] : '';
//                     svgData = svgData.replace(/<defs>[\s\S]*?<\/defs>/, '');
                    
//                     svgContents.push({
//                         defs: defs,
//                         content: svgData.trim()
//                     });
//                     resolve();
//                 });
//             });
//         }

//         // 모든 defs를 하나로 통합
//         const allDefs = svgContents.map(item => item.defs).join('\n');

//         const svgDocument = `<?xml version="1.0" encoding="UTF-8"?>
// <svg xmlns="http://www.w3.org/2000/svg" 
//      xmlns:xlink="http://www.w3.org/1999/xlink"
//      width="${canvasWidth}" 
//      height="${canvasHeight * views.length}" 
//      viewBox="0 0 ${canvasWidth} ${canvasHeight * views.length}">
//     <defs>
//         ${allDefs}
//     </defs>
//     ${svgContents.map((item, index) => `
//     <g transform="translate(0, ${index * canvasHeight})">
//         ${item.content}
//     </g>`).join('\n')}
// </svg>`;

//         const blob = new Blob([svgDocument], { type: 'image/svg+xml;charset=utf-8' });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
        
//         const date = new Date();
//         const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}`;
//         link.download = `bracelet_design_${timestamp}.svg`;
        
//         link.click();
//         URL.revokeObjectURL(url);

//         currentView = originalView;
//         fabricCanvas.clear();
//         fabricCanvas.loadFromJSON(JSON.parse(originalState), function() {
//             fabricCanvas.renderAll();
//         });
//     }

//     const saveButton = document.getElementById('saveButton');
//     if (saveButton) {
//         saveButton.addEventListener('click', exportAllViewsToSVG);
//     } else {
//         console.error('Save button not found in the document');
//     }
// });

/* 빈캔버스도 저장하는 코드 */
// document.addEventListener('DOMContentLoaded', function() {
//     async function exportAllViewsToSVG() {
//         const views = ['outer-front', 'outer-back', 'inner-front', 'inner-back'];
//         const originalView = currentView;
//         const originalState = JSON.stringify(canvasInstances[currentView].toJSON());
        
//         const svgContents = [];
//         const canvasHeight = fabricCanvas.height;
//         const canvasWidth = fabricCanvas.width;
        
//         for (const view of views) {
//             await new Promise(resolve => {
//                 currentView = view;
//                 const viewState = canvasInstances[view]?.toJSON() };
                
//                 fabricCanvas.clear();
//                 fabricCanvas.loadFromJSON(viewState, function() {
//                     let svgData = fabricCanvas.toSVG({
//                         suppressPreamble: true,
//                         viewBox: {
//                             x: 0,
//                             y: 0,
//                             width: fabricCanvas.width,
//                             height: fabricCanvas.height
//                         }
//                     })
//                         .replace(/<\?xml[^>]*\?>/, '')
//                         .replace(/<!DOCTYPE[^>]*>/, '')
//                         .replace(/<svg[^>]*>/, '')
//                         .replace(/<\/svg>/, '')
//                         .replace(/<desc>Created with Fabric.js[^<]*<\/desc>/, '');
                    
//                     const defsMatch = svgData.match(/<defs>([\s\S]*?)<\/defs>/);
//                     const defs = defsMatch ? defsMatch[1] : '';
//                     svgData = svgData.replace(/<defs>[\s\S]*?<\/defs>/, '');
                    
//                     svgContents.push({
//                         defs: defs,
//                         content: svgData.trim()
//                     });
//                     resolve();
//                 });
//             });
//         }

//         // 모든 defs를 하나로 통합
//         const allDefs = svgContents.map(item => item.defs).join('\n');

//         const svgDocument = `<?xml version="1.0" encoding="UTF-8"?>
// <svg xmlns="http://www.w3.org/2000/svg" 
//      xmlns:xlink="http://www.w3.org/1999/xlink"
//      width="${canvasWidth}" 
//      height="${canvasHeight * views.length}" 
//      viewBox="0 0 ${canvasWidth} ${canvasHeight * views.length}">
//     <defs>
//         ${allDefs}
//     </defs>
//     ${svgContents.map((item, index) => `
//     <g transform="translate(0, ${index * canvasHeight})">
//         ${item.content}
//     </g>`).join('\n')}
// </svg>`;

//         const blob = new Blob([svgDocument], { type: 'image/svg+xml;charset=utf-8' });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
        
//         const date = new Date();
//         const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}`;
//         link.download = `bracelet_design_${timestamp}.svg`;
        
//         link.click();
//         URL.revokeObjectURL(url);

//         currentView = originalView;
//         fabricCanvas.clear();
//         fabricCanvas.loadFromJSON(JSON.parse(originalState), function() {
//             fabricCanvas.renderAll();
//         });
//     }

//     const saveButton = document.getElementById('saveButton');
//     if (saveButton) {
//         saveButton.addEventListener('click', exportAllViewsToSVG);
//     } else {
//         console.error('Save button not found in the document');
//     }
// });

/* 가장 고도화 */
// document.addEventListener('DOMContentLoaded', function() {
//     async function exportAllViewsToSVG() {
//         const views = ['outer-front', 'outer-back', 'inner-front', 'inner-back'];
//         const originalView = currentView;
//         const originalState = canvasInstances[currentView] ? 
//             JSON.stringify(canvasInstances[currentView].toJSON()) : 
//             JSON.stringify({ objects: [] });
        
//         const svgContents = [];
//         const canvasHeight = fabricCanvas.height;
//         const canvasWidth = fabricCanvas.width;
        
//         for (const view of views) {
//             await new Promise(resolve => {
//                 currentView = view;
//                 const viewState = canvasInstances[view]?.toJSON() || { objects: [] };
                
//                 fabricCanvas.clear();
//                 fabricCanvas.loadFromJSON(viewState, function() {
//                     let svgData = fabricCanvas.toSVG({
//                         suppressPreamble: true,
//                         viewBox: {
//                             x: 0,
//                             y: 0,
//                             width: fabricCanvas.width,
//                             height: fabricCanvas.height
//                         }
//                     })
//                         .replace(/<\?xml[^>]*\?>/, '')
//                         .replace(/<!DOCTYPE[^>]*>/, '')
//                         .replace(/<svg[^>]*>/, '')
//                         .replace(/<\/svg>/, '')
//                         .replace(/<desc>Created with Fabric.js[^<]*<\/desc>/, '');
                    
//                     const defsMatch = svgData.match(/<defs>([\s\S]*?)<\/defs>/);
//                     const defs = defsMatch ? defsMatch[1] : '';
//                     svgData = svgData.replace(/<defs>[\s\S]*?<\/defs>/, '');
                    
//                     svgContents.push({
//                         defs: defs,
//                         content: svgData.trim()
//                     });
//                     resolve();
//                 });
//             });
//         }

//         // 모든 defs를 하나로 통합
//         const allDefs = svgContents.map(item => item.defs).join('\n');

//         const svgDocument = `<?xml version="1.0" encoding="UTF-8"?>
// <svg xmlns="http://www.w3.org/2000/svg" 
//      xmlns:xlink="http://www.w3.org/1999/xlink"
//      width="${canvasWidth}" 
//      height="${canvasHeight * views.length}" 
//      viewBox="0 0 ${canvasWidth} ${canvasHeight * views.length}">
//     <defs>
//         ${allDefs}
//     </defs>
//     ${svgContents.map((item, index) => `
//     <g transform="translate(0, ${index * canvasHeight})">
//         ${item.content}
//     </g>`).join('\n')}
// </svg>`;

//         const blob = new Blob([svgDocument], { type: 'image/svg+xml;charset=utf-8' });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
        
//         const date = new Date();
//         const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}`;
//         link.download = `bracelet_design_${timestamp}.svg`;
        
//         link.click();
//         URL.revokeObjectURL(url);

//         currentView = originalView;
//         fabricCanvas.clear();
//         fabricCanvas.loadFromJSON(JSON.parse(originalState), function() {
//             fabricCanvas.renderAll();
//         });
//     }

//     const saveButton = document.getElementById('saveButton');
//     if (saveButton) {
//         saveButton.addEventListener('click', exportAllViewsToSVG);
//     } else {
//         console.error('Save button not found in the document');
//     }
// });

// document.addEventListener('DOMContentLoaded', function() {
//     async function exportAllViewsToSVG() {
//         const views = ['outer-front', 'outer-back', 'inner-front', 'inner-back'];
//         const originalView = currentView;
        
//         // 현재 모든 뷰의 상태를 백업
//         const viewStates = {};
//         views.forEach(view => {
//             if (canvasInstances[view]) {
//                 viewStates[view] = canvasInstances[view].toJSON();
//             }
//         });
        
//         const svgContents = [];
//         const canvasHeight = fabricCanvas.height;
//         const canvasWidth = fabricCanvas.width;
        
//         for (const view of views) {
//             await new Promise(resolve => {
//                 currentView = view;
//                 console.log(`Processing view: ${view}`);
                
//                 // 저장된 상태가 있는지 확인
//                 const viewState = viewStates[view];
//                 if (!viewState) {
//                     console.log(`No state found for view: ${view}`);
//                     svgContents.push({
//                         defs: '',
//                         content: ''
//                     });
//                     resolve();
//                     return;
//                 }

//                 fabricCanvas.clear();
//                 fabricCanvas.loadFromJSON(viewState, function() {
//                     let svgData = fabricCanvas.toSVG({
//                         suppressPreamble: true,
//                         viewBox: {
//                             x: 0,
//                             y: 0,
//                             width: fabricCanvas.width,
//                             height: fabricCanvas.height
//                         }
//                     })
//                         .replace(/<\?xml[^>]*\?>/, '')
//                         .replace(/<!DOCTYPE[^>]*>/, '')
//                         .replace(/<svg[^>]*>/, '')
//                         .replace(/<\/svg>/, '')
//                         .replace(/<desc>Created with Fabric.js[^<]*<\/desc>/, '');
                    
//                     const defsMatch = svgData.match(/<defs>([\s\S]*?)<\/defs>/);
//                     const defs = defsMatch ? defsMatch[1] : '';
//                     svgData = svgData.replace(/<defs>[\s\S]*?<\/defs>/, '');
                    
//                     svgContents.push({
//                         defs: defs,
//                         content: svgData.trim()
//                     });
//                     resolve();
//                 });
//             });
//         }

//         // 모든 defs를 하나로 통합
//         const allDefs = svgContents.map(item => item.defs).join('\n');

//         const svgDocument = `<?xml version="1.0" encoding="UTF-8"?>
// <svg xmlns="http://www.w3.org/2000/svg" 
//      xmlns:xlink="http://www.w3.org/1999/xlink"
//      width="${canvasWidth}" 
//      height="${canvasHeight * views.length}" 
//      viewBox="0 0 ${canvasWidth} ${canvasHeight * views.length}">
//     <defs>
//         ${allDefs}
//     </defs>
//     ${svgContents.map((item, index) => `
//     <g transform="translate(0, ${index * canvasHeight})">
//         ${item.content}
//     </g>`).join('\n')}
// </svg>`;

//         const blob = new Blob([svgDocument], { type: 'image/svg+xml;charset=utf-8' });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
        
//         const date = new Date();
//         const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}`;
//         link.download = `bracelet_design_${timestamp}.svg`;
        
//         link.click();
//         URL.revokeObjectURL(url);

//         currentView = originalView;
//         fabricCanvas.clear();
//         fabricCanvas.loadFromJSON(JSON.parse(originalState), function() {
//             fabricCanvas.renderAll();
//         });
//     }

//     const saveButton = document.getElementById('saveButton');
//     if (saveButton) {
//         saveButton.addEventListener('click', exportAllViewsToSVG);
//     } else {
//         console.error('Save button not found in the document');
//     }
// });

document.addEventListener('DOMContentLoaded', function() {
    async function exportAllViewsToSVG() {
        const views = ['outer-front', 'outer-back', 'inner-front', 'inner-back'];
        const originalView = currentView;
        const originalState = canvasInstances[currentView] ? 
            JSON.stringify(canvasInstances[currentView].toJSON()) : 
            JSON.stringify({ objects: [] });
        
        const svgContents = [];
        const canvasHeight = fabricCanvas.height;
        const canvasWidth = fabricCanvas.width;
        
        for (const view of views) {
            await new Promise(resolve => {
                currentView = view;
                console.log(`Processing view: ${view}`);
                
                const viewState = canvasInstances[view]?.toJSON() || { objects: [] };
                console.log('View state:', viewState); // 디버깅용
                
                fabricCanvas.clear();
                fabricCanvas.loadFromJSON(viewState, () => {
                    // fabricCanvas가 완전히 로드된 후에 SVG 생성
                    fabricCanvas.renderAll();
                    
                    let svgData = fabricCanvas.toSVG({
                        suppressPreamble: true,
                        viewBox: {
                            x: 0,
                            y: 0,
                            width: fabricCanvas.width,
                            height: fabricCanvas.height
                        }
                    })
                    .replace(/<\?xml[^>]*\?>/, '')
                    .replace(/<!DOCTYPE[^>]*>/, '')
                    .replace(/<svg[^>]*>/, '')
                    .replace(/<\/svg>/, '')
                    .replace(/<desc>Created with Fabric.js[^<]*<\/desc>/, '');
                    
                    const defsMatch = svgData.match(/<defs>([\s\S]*?)<\/defs>/);
                    const defs = defsMatch ? defsMatch[1] : '';
                    svgData = svgData.replace(/<defs>[\s\S]*?<\/defs>/, '');
                    
                    svgContents.push({
                        defs: defs,
                        content: svgData.trim()
                    });
                    
                    // SVG 생성이 완료된 후에 resolve 호출
                    resolve();
                });
            });
        }

        // 모든 defs를 하나로 통합
        const allDefs = svgContents.map(item => item.defs).join('\n');

        const svgDocument = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${canvasWidth}" 
     height="${canvasHeight * views.length}" 
     viewBox="0 0 ${canvasWidth} ${canvasHeight * views.length}">
    <defs>
        ${allDefs}
    </defs>
    ${svgContents.map((item, index) => `
    <g transform="translate(0, ${index * canvasHeight})">
        ${item.content}
    </g>`).join('\n')}
</svg>`;

        const blob = new Blob([svgDocument], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const date = new Date();
        const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}`;
        link.download = `bracelet_design_${timestamp}.svg`;
        
        link.click();
        URL.revokeObjectURL(url);

        currentView = originalView;
        fabricCanvas.clear();
        fabricCanvas.loadFromJSON(JSON.parse(originalState), function() {
            fabricCanvas.renderAll();
        });
    }

    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', exportAllViewsToSVG);
    } else {
        console.error('Save button not found in the document');
    }
});
