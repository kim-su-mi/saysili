
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
                '#ffffff', //기본
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
            colors.forEach(color => {
                const colorButton = document.createElement('button');
                colorButton.style.backgroundColor = color;
                colorButton.style.width = '50px';
                colorButton.style.height = '50px';
                colorButton.addEventListener('click', () => changeBraceletColor(color));
                colorPicker.appendChild(colorButton);
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
    function changeBraceletColor(baseColor) {
        const gradients = [
            '_무제_그라디언트_95',
            '_무제_그라디언트_92',
            '_무제_그라디언트_78'
        ];

        // 각 그라디언트 업데이트
        gradients.forEach((gradientId, index) => {
            const gradient = document.getElementById(gradientId);
            if (gradient) {
                const stops = gradient.getElementsByTagName('stop');
                const adjustment = [-20, 0, -40][index]; // 각 그라디언트마다 다른 밝기 조정

                for (let stop of stops) {
                    stop.setAttribute('stop-color', adjustColor(baseColor, adjustment));
                }
            }
        });

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
    
            // 각 rect 클래스별로 적절한 y좌표와 height 설정
            Object.entries(newSize.rects).forEach(([className, values]) => {
                const rect = svgElement.querySelector(`.${className}`);
                if (rect) {
                    rect.setAttribute('width', `${newSize.width}`);
                    rect.setAttribute('y', `${values.y}`);
                    rect.setAttribute('height', `${values.height}`);
                }
            });
    
            // style 속성 업데이트
            svgElement.style.width = `${newSize.width}px`;
            svgElement.style.height = `${newSize.height}px`;

            //activeCanvas 크기 조절
            const activeCanvas = document.getElementById('activeCanvas');
            if(activeCanvas){
                // 팔찌 이미지의 크기를 기준으로 캔버스 크기 설정
                const canvasWidth = newSize.width * 0.8;  // rect의 너비의 80%
                const canvasHeight = newSize.height * 0.8;  // rect의 높이의 90%
            
                activeCanvas.width = canvasWidth;
                activeCanvas.height = canvasHeight;
                
               // Fabric.js 캔버스 크기 설정
               fabricCanvas.setWidth(canvasWidth);
               fabricCanvas.setHeight(canvasHeight);
               fabricCanvas.setDimensions({
                   width: canvasWidth,
                   height: canvasHeight
               });

               fabricCanvas.renderAll();

                // 사이즈 변함에 따라 span영역 인쇄 가능 크기 텍스트 업데이트
                const printableAreaSpan = document.querySelector('.printable-area span');
                if (printableAreaSpan) {
                    const existingText = printableAreaSpan.textContent.split('-')[0];  // html의 span태그의 "인쇄가능영역 -" 부분 유지
                    printableAreaSpan.textContent = `${existingText}- ${newSize.printSize}`;
                }    
            }
        }
    }
    // 크기 변경 버튼 이벤트 리스너 추가
    document.getElementById('s-size').addEventListener('click', () => resizeBracelet('s'));
    document.getElementById('m-size').addEventListener('click', () => resizeBracelet('m'));
    document.getElementById('l-size').addEventListener('click', () => resizeBracelet('l'));

    
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