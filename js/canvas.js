// 캔버스 생성
document.addEventListener('DOMContentLoaded', function() {
    /**
     * 방법1. canvas안쓰고 이미지에 바로 색상 변경 *이미지가 svg파일이어야함
     */
    
   
    // const braceletImage = document.getElementById('braceletImage');
    // const colorPicker = document.getElementById('colorPicker');
    
    // // SVG 내용 로드
    // fetch(braceletImage.src)
    //     .then(response => response.text())
    //     .then(svgContent => {
    //         const parser = new DOMParser();
    //         const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    //         braceletImage.parentNode.replaceChild(svgDoc.documentElement, braceletImage);
            
    //         // 색상 선택 버튼 생성
    //         const colors = ['rgb(255, 0, 0)', 'blue', 'green', 'yellow', 'purple'];
    //         colors.forEach(color => {
    //             const colorButton = document.createElement('button');
    //             colorButton.style.backgroundColor = color;
    //             colorButton.style.width = '50px';
    //             colorButton.style.height = '50px';
    //             colorButton.addEventListener('click', () => changeBraceletColor(color));
    //             colorPicker.appendChild(colorButton);
    //         });
    //     });

    // // 이미지 색상 변경 함수
    // function changeBraceletColor(color) {
    //     const svgElement = document.querySelector('#bracelet svg');
    //     if (svgElement) {
    //         const svgPaths = svgElement.querySelectorAll('path, polygon, rect, circle');
    //         svgPaths.forEach(path => {
    //             path.setAttribute('fill', color);
    //         });
    //     }
    // }
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
                
                // 캔버스 생성
                const canvas = new fabric.Canvas('activeCanvas');
                // 캔버스 잘 생성 됐나 원 객체 생성해서 확인 ==> 니중에 삭제
                const circle = new fabric.Circle({
                    left: 0,
                    top: 0,
                    radius: 20,
                    fill: 'red'
                });
                canvas.add(circle);
                canvas.renderAll();
                // // Canvas를 SVG 중앙에 위치시키기
                // const leftOffset = (newSize.width - canvasWidth) / 2;
                // const topOffset = (newSize.height - canvasHeight) / 2;
                
                // activeCanvas.style.position = 'absolute';
                // activeCanvas.style.left = `${leftOffset}px`;
                // activeCanvas.style.top = `${topOffset}px`;
            }
        }
    }
    
    // 크기 변경 버튼 이벤트 리스너 추가
    document.getElementById('s-size').addEventListener('click', () => resizeBracelet('s'));
    document.getElementById('m-size').addEventListener('click', () => resizeBracelet('m'));
    document.getElementById('l-size').addEventListener('click', () => resizeBracelet('l'));

    

    /**
     * 방법2. canvas로 이미지 사진 색상 변경
     */
    // // 캔버스 생성
    // const backgroundCanvas = new fabric.Canvas('backgroundCanvas', {
    //     width: 500,
    //     height: 200
    // });

    // const activeCanvas = new fabric.Canvas('activeCanvas', {
    //     width: 350,
    //     height: 80
    // });

    // // 팔찌 이미지 로드
    // fabric.Image.fromURL('images/band.png', function(img) {
    //     img.set({
    //         selectable: false,
    //         evented: false,
    //         lockMovementX: true,
    //         lockMovementY: true,
    //         lockRotation: true,
    //         lockScalingX: true,
    //         lockScalingY: true
    //     });
    //     img.scaleToWidth(400);
    //     backgroundCanvas.add(img);
    //     backgroundCanvas.centerObject(img);
    //     backgroundCanvas.renderAll();

    // });

    // // 색상 선택 버튼 생성 (변경 없음)
    // const colors = ['rgb(255, 0, 0)', 'blue', 'green', 'yellow', 'purple'];
    // const colorPicker = document.getElementById('colorPicker');
    // colors.forEach(color => {
    //     const colorButton = document.createElement('button');
    //     colorButton.style.backgroundColor = color;
    //     colorButton.style.width = '100px';
    //     colorButton.style.height = '100px';
    //     colorButton.addEventListener('click', () => changeBraceletColor(color));
    //     colorPicker.appendChild(colorButton);
    // });

    // // 이미지 색상 변경 함수 (변경 없음)
    // function changeBraceletColor(color) {
    //     const bracelet = backgroundCanvas.getObjects()[0];
    //     bracelet.filters = [new fabric.Image.filters.BlendColor({
    //         color: color,
    //         mode: 'tint',
    //         alpha: 0.9
    //     })];
    //     bracelet.applyFilters();
    //     backgroundCanvas.renderAll();
    // }

    // // activeCanvas에 원 객체 추가
    // const circle = new fabric.Circle({
    //     radius: 20,
    //     fill: 'red',
    //     left: 50,
    //     top: 20
    // });

});

