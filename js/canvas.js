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
    fetch(braceletImage.data)
        .then(response => response.text())
        .then(svgContent => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
            braceletImage.parentNode.replaceChild(svgDoc.documentElement, braceletImage);
            
            // 색상 선택 버튼 생성
            const colors = ['#97fc2a','#ff0000', '#0000ff', '#00ff00', '#ffff00', '#800080'];
            colors.forEach(color => {
                const colorButton = document.createElement('button');
                colorButton.style.backgroundColor = color;
                colorButton.style.width = '50px';
                colorButton.style.height = '50px';
                colorButton.addEventListener('click', () => changeBraceletColor(color));
                colorPicker.appendChild(colorButton);
            });
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
     document.getElementById('s-size').addEventListener('click', () => resizeBracelet('s'));
     document.getElementById('m-size').addEventListener('click', () => resizeBracelet('m'));
     document.getElementById('l-size').addEventListener('click', () => resizeBracelet('l'));

     function resizeBracelet(size){
        const braceletImage = document.getElementById('braceletImage');
        switch(size){
            case 's':
                braceletImage.style.width = "603.153px";
                braceletImage.style.height = "87.732px";
                break;
            case 'm':
                braceletImage.style.width = "676.263px";
                braceletImage.style.height = "91.387px";
                break;
            case 'l':
                braceletImage.style.width = "731.095px";
                braceletImage.style.height = "87.731px";
                break;
        }
     }
    




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

