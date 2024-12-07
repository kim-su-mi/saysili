// 전역 변수로 fabricCanvas 선언
let fabricCanvas;

document.addEventListener('DOMContentLoaded', function() {
    // Fabric.js 캔버스 초기화
    fabricCanvas = new fabric.Canvas('activeCanvas', {
        width: 0,  // 초기 크기는 0으로 설정
        height: 0
    });

    /**
     * 색상 변경에 대한 js
     */
    const braceletImage = document.getElementById('braceletImage');
    const colorPicker = document.getElementById('colorPicker');
    
    // SVG 내용 로드
    fetch(braceletImage.src)
        .then(response => response.text())
        .then(svgContent => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
            braceletImage.parentNode.replaceChild(svgDoc.documentElement, braceletImage);

            // 색상 선택 버튼 생성
            const colors = ['#f70303',
                '#fd4eb5',
                '#f284c1',
                '#f2a9c4',
                '#ff9f2f',
                '#feed01',
                '#87dc29',
                '#f9ec90',
                '#0bc349',
                '#01c8a9',
                '#00b7e9',
                '#abebd3',
                '#2456ed',
                '#8f4fdb',
                '#4a236d',
                '#d7ccee',
                '#898989',
                '#aa967e',
                '#202020',
                '#ffffff', //일반
                '#fa9529',
                '#fbf666',
                '#54e669',
                '#d6e00d',
                '#fbc9d4',
                '#fac79c',
                '#c6f5b1',
                '#b5ebd1',
                '#1896e3',
                '#9473c2', //야광
                '#ebebeb',
                '#f6cfd2',
                '#d7edfa',
                '#e3f1da',
                '#ecdff3', // 투명
            ];

            // 색상 배열을 카테고리별로 분리
            const colorCategories = {
                normal: colors.slice(0, 20),    // 일반 컬러
                glow: colors.slice(20, 30),     // 야광 컬러
                transparent: colors.slice(30)    // 투명 컬러
            };

            // 각 카테고리별 컬러 버튼 생성
            Object.entries(colorCategories).forEach(([category, categoryColors]) => {
                const container = document.querySelector(`.color-grid.${category}`);
                if (container) {
                    categoryColors.forEach((color, index) => {
                        const colorButton = document.createElement('button');
                        colorButton.className = 'color_selection_btn w-button';
                        colorButton.style.backgroundColor = color;
                        
                        const prefix = {
                            normal: 'col_',
                            glow: 'lum_',
                            transparent: 'tp_'
                        }[category];
                        colorButton.id = `${prefix}${index + 1}`;
                        
                        // 초기 선택된 색상(#00b7e9)에 active 클래스 추가
                        if (color === '#00b7e9') {
                            colorButton.classList.add('active');
                        }
                        
                        colorButton.addEventListener('click', () => {
                            // 모든 카테고리의 버튼에서 active 클래스 제거
                            document.querySelectorAll('.color-grid button').forEach(btn => {
                                btn.classList.remove('active');
                            });
                            // 클릭된 버튼에 active 클래스 추가
                            colorButton.classList.add('active');
                            changeBraceletColor(color);
                        });
                        
                        container.appendChild(colorButton);
                    });
                }
            });

            //SVG 요소에 ID 추가
            const svgElement = document.querySelector('#bracelet svg');
            svgElement.id = 'braceletSVG';
            
            // 초기 크기를 S 사이즈로 설정
            resizeBracelet('s');

            
        });

    // 색상 조정 helper 함수
    function adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.min(255, Math.max(0, parseInt(hex.slice(0,2), 16) + amount));
        const g = Math.min(255, Math.max(0, parseInt(hex.slice(2,4), 16) + amount));
        const b = Math.min(255, Math.max(0, parseInt(hex.slice(4,6), 16) + amount));
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    }

    // 이미지 색상 변경 함수
    // 이미지 색상 변경 함수
    function changeBraceletColor(baseColor) {
        // bracelet.svg용 그라디언트
        const outerGradients = [
            '_무제_그라디언트_95',
            '_무제_그라디언트_92',
            '_무제_그라디언트_78'
        ];

        // bracelet.svg 그라디언트 업데이트
        outerGradients.forEach((gradientId, index) => {
            const gradient = document.getElementById(gradientId);
            if (gradient) {
                const stops = gradient.getElementsByTagName('stop');
                const adjustment = [-20, 0, -40][index];

                for (let stop of stops) {
                    stop.setAttribute('stop-color', adjustColor(baseColor, adjustment));
                }
            }
        });

        // braceletInner.svg용 그라디언트 업데이트
        const innerGradient = document.getElementById('_무제_그라디언트_78');
        if (innerGradient) {
            const stops = innerGradient.getElementsByTagName('stop');
            const gradientStops = [
                { offset: "0", adjustment: -45 },
                { offset: "0.057", adjustment: -30 },
                { offset: "0.128", adjustment: -20 },
                { offset: "0.183", adjustment: -10 },
                { offset: "0.625", adjustment: -10 },
                { offset: "0.784", adjustment: -20 },
                { offset: "0.897", adjustment: -30 },
                { offset: "0.988", adjustment: -40 },
                { offset: "1", adjustment: -45 }
            ];

            // 기존 stop 요소들 제거
            while (stops.length > 0) {
                stops[0].remove();
            }

            // 새로운 stop 요소들 추가
            gradientStops.forEach(({ offset, adjustment }) => {
                const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
                stop.setAttribute("offset", offset);
                stop.setAttribute("stop-color", adjustColor(baseColor, adjustment));
                innerGradient.appendChild(stop);
            });
        }

        // 두 번째 그라디언트 업데이트 (무제_그라디언트_95-2)
        const gradient2 = document.getElementById('_무제_그라디언트_95-2');
        if (gradient2) {
            const stops = gradient2.getElementsByTagName('stop');
            for (let stop of stops) {
                stop.setAttribute('stop-color', adjustColor(baseColor, -20));
            }
        }
    }

    /**
     * 크기 변경에 대한 js
     */
    function resizeBracelet(size) {
        const svgElement = document.querySelector('#braceletSVG');
        if (!svgElement) return;
    
        const sizes = {
            's': { 
                width: 603.153, 
                height: 102.346,
                printSize: '65 x 8mm',
                rects: {
                    'cls-1': { y: 14.614, height: 87.732 },
                    'cls-2': { y: 0, height: 87.732 },
                    'cls-3': { y: 11.101, height: 87.732 },
                    'cls-4': { y: 7.678, height: 87.732 }
                }
            },
            'm': { 
                width: 676.263, 
                height: 102.387,
                printSize: '75 x 8mm',
                rects: {
                    'cls-1': { y: 14.614, height: 87.732 },
                    'cls-2': { y: 0, height: 87.732 },
                    'cls-3': { y: 11.101, height: 87.732 },
                    'cls-4': { y: 7.678, height: 87.732 }
                }
            },
            'l': { 
                width: 731.095, 
                height: 102.731,
                printSize: '80 x 8mm',
                rects: {
                    'cls-1': { y: 14.614, height: 87.732 },
                    'cls-2': { y: 0, height: 87.732 },
                    'cls-3': { y: 11.101, height: 87.732 },
                    'cls-4': { y: 7.678, height: 87.732 }
                }
            }
        };
    
        const newSize = sizes[size];
        if (newSize) {
            // viewBox 속성 업데이트
            svgElement.setAttribute('viewBox', `0 0 ${newSize.width} ${newSize.height}`);
            svgElement.setAttribute('width', `${newSize.width}`);
            svgElement.setAttribute('height', `${newSize.height}`);
    
            // bracelet.svg용 rect 업데이트
            Object.entries(newSize.rects).forEach(([className, values]) => {
                const rect = svgElement.querySelector(`.${className}`);
                if (rect) {
                    rect.setAttribute('width', `${newSize.width}`);
                    rect.setAttribute('y', `${values.y}`);
                    rect.setAttribute('height', `${values.height}`);
                }
            });
    
            // braceletInner.svg용 path 업데이트
            const innerPath = svgElement.querySelector('.cls-1');
            if (innerPath) {
                const newPath = `M${newSize.width},102.346H0C4.004,102.346,4.004,0,0,0h${newSize.width}c-4.18,0-4.18,102.346,0,102.346Z`;
                innerPath.setAttribute('d', newPath);
            }
    
            // 그라디언트 업데이트 (bracelet.svg와 braceletInner.svg 모두)
            const gradients = [
                '_무제_그라디언트_95',
                '_무제_그라디언트_92',
                '_무제_그라디언트_78'
            ];
    
            gradients.forEach(gradientId => {
                const gradient = svgElement.querySelector(`#${gradientId}`);
                if (gradient) {
                    gradient.setAttribute('x2', newSize.width);
                }
            });
    
            // style 속성 업데이트
            svgElement.style.width = `${newSize.width}px`;
            svgElement.style.height = `${newSize.height}px`;
    
            //activeCanvas 크기 조절
            const activeCanvas = document.getElementById('activeCanvas');
            if(activeCanvas){
                const canvasWidth = newSize.width * 0.8;
                const canvasHeight = newSize.height * 0.8;
            
                activeCanvas.width = canvasWidth;
                activeCanvas.height = canvasHeight;
                
                fabricCanvas.setWidth(canvasWidth);
                fabricCanvas.setHeight(canvasHeight);
                fabricCanvas.setDimensions({
                    width: canvasWidth,
                    height: canvasHeight
                });
    
                fabricCanvas.renderAll();
    
                const printableAreaSpan = document.querySelector('.printable-area span');
                if (printableAreaSpan) {
                    const existingText = printableAreaSpan.textContent.split('-')[0];
                    printableAreaSpan.textContent = `${existingText}- ${newSize.printSize}`;
                }    
            }
        }
    }
    // 사이즈 버튼 상태 업데이트 함수
    function updateSizeButtonState(activeId) {
        ['size_S', 'size_M', 'size_L'].forEach(id => {
            document.getElementById(id).classList.remove('active');
        });
        document.getElementById(activeId).classList.add('active');
    }
    
    // 초기 S 사이즈 버튼에 active 클래스 추가
    document.getElementById('size_S').classList.add('active');

    // 크기 변경 버튼 이벤트 리스너 추가
    document.getElementById('size_S').addEventListener('click', () => {
        updateSizeButtonState('size_S');
        resizeBracelet('s');
    });
    document.getElementById('size_M').addEventListener('click', () => {
        updateSizeButtonState('size_M');
        resizeBracelet('m');
    });
    document.getElementById('size_L').addEventListener('click', () => {
        updateSizeButtonState('size_L');
        resizeBracelet('l');
    });

    
    /*
    *테스트를 위한 도형 추가
    */
    fabricCanvas.add(new fabric.Circle({
        radius: 20,
        fill: 'red',
        left: 50,
        top: 20
    }));

    
    // fabricCanvas.add(text);
    fabricCanvas.renderAll();

     /**
     * 팔찌 뷰 전환에 대한 js
     */
     const viewButtons = document.querySelectorAll('#viewButtons button');
     
     viewButtons.forEach(button => {
         button.addEventListener('click', function() {
             // 모든 버튼의 활성화 상태 제거
             viewButtons.forEach(btn => btn.classList.remove('active'));
             
             // 클릭된 버튼 활성화
             this.classList.add('active');
             
             // 뷰에 따른 이미지 변경
             const view = this.dataset.view;
             switch(view) {
                 case 'outer-front':
                 case 'outer-back':
                     braceletImage.src = 'images/bracelet.svg';
                     break;
                 case 'inner-front':
                 case 'inner-back':
                     braceletImage.src = 'images/braceletInner.svg';
                     break;
             }
             
             // SVG 다시 로드 및 현재 색상 유지
             fetch(braceletImage.src)
                 .then(response => response.text())
                 .then(svgContent => {
                     const parser = new DOMParser();
                     const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
                     const oldSvg = document.querySelector('#braceletSVG');
                     if (oldSvg) {
                         oldSvg.parentNode.replaceChild(svgDoc.documentElement, oldSvg);
                         const newSvg = document.querySelector('svg');
                         newSvg.id = 'braceletSVG';
                         
                         // 현재 선택된 사이즈 유지
                         const currentSize = document.querySelector('#sizepicker button.active')?.id?.charAt(0) || 's';
                         resizeBracelet(currentSize);

                         // 현재 선택된 색상 유지
                        const activeColorButton = document.querySelector('#colorPicker button.active');
                        if (activeColorButton) {
                            const currentColor = activeColorButton.style.backgroundColor;
                        changeBraceletColor(rgbToHex(currentColor));
                    }
                     }
                 });
         });
     });

     // RGB 색상을 HEX 코드로 변환하는 헬퍼 함수
    function rgbToHex(rgb) {
        // rgb(r, g, b) 형식에서 숫자만 추출
        const rgbArray = rgb.match(/\d+/g);
        if (!rgbArray) return rgb; // 이미 hex 형식이면 그대로 반환

        const r = parseInt(rgbArray[0]);
        const g = parseInt(rgbArray[1]);
        const b = parseInt(rgbArray[2]);

        return '#' + 
            r.toString(16).padStart(2, '0') + 
            g.toString(16).padStart(2, '0') + 
            b.toString(16).padStart(2, '0');
    }


   

});

// 모달 외부 클릭 시 닫기 이벤트 추가
document.addEventListener('click', function(event) {
    const textModal = document.getElementById('textModal');
    const templateModal = document.getElementById('templateModal');
    const imageModal = document.getElementById('imageModal');
    
    // 텍스트 모달 외부 클릭 감지
    if (event.target.classList.contains('modal') && event.target === textModal) {
        const modal = bootstrap.Modal.getInstance(textModal);
        if (modal) {
            modal.hide();
        }
    }
    
    // 템플릿 모달 외부 클릭 감지
    if (event.target.classList.contains('modal') && event.target === templateModal) {
        const modal = bootstrap.Modal.getInstance(templateModal);
        if (modal) {
            modal.hide();
        }
    }

    // 이미지 모달 외부 클릭 감지
    if (event.target.classList.contains('modal') && event.target === imageModal) {
        const modal = bootstrap.Modal.getInstance(imageModal);
        if (modal) {
            modal.hide();
        }
    }
});