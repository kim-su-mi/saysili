// 공통으로 사용할 색상 리스트 정의
const commonColors = {
    basic: [
        '#f70303','#fd4eb5','#f284c1','#f2a9c4','#ff9f2f',
        '#feed01','#87dc29','#f9ec90','#0bc349','#01c8a9',
        '#00b7e9','#abebd3','#2456ed','#8f4fdb','#4a236d',
        '#d7ccee','#898989','#aa967e','#000000','#ffffff'
    ],
    // 야광
    glow: [
        '#fa9529','#fbf666','#54e669','#d6e00d','#fbc9d4',
        '#fac79c','#c6f5b1','#b5ebd1','#1896e3','#9473c2'
    ],
    // 투명
    transparent: [
        '#ebebeb','#f6cfd2','#d7edfa','#e3f1da','#ecdff3'
    ]
};

// 전역 변수로 현재 선택된 색상 저장
let currentSelectedColor = '#ffffff'; // 기본값 흰색

// 색상 버튼 생성 함수
function setupColorButtonEvents(fabricCanvas) {
    // 객체가 선택되었을 때
    fabricCanvas.on('selection:created', handleObjectSelection);

    // 객체 선택이 변경되었을 때
    fabricCanvas.on('selection:updated', handleObjectSelection);

    // 객체 선택이 해제되었을 때
    fabricCanvas.on('selection:cleared', function() {
        const colorPicker = document.querySelector('.template-image-color-picker');
        colorPicker.innerHTML = ''; // 색상 버튼 제거
    });
}

// 객체 선택 처리 함수
function handleObjectSelection(e) {
    const selectedObject = e.selected[0];
    const colorPicker = document.querySelector('.template-image-color-picker');
    
    if (selectedObject instanceof fabric.IText) {
        // 텍스트 객체가 선택된 경우
        colorPicker.innerHTML = ''; // 색상 버튼 제거
        
        // 텍스트 모달 표시
        const textModal = new bootstrap.Modal(document.getElementById('textModal'));
        textModal.show();
        
        // 현재 선택된 텍스트 객체를 전역 변수에 저장 (textUpload.js에서 사용)
        window.currentText = selectedObject;
        
        // 모달 컨트롤 상태 업데이트
        if (typeof updateModalControls === 'function') {
            updateModalControls();
        }
    } 
    else if (selectedObject.objectType === 'image' || selectedObject.objectType === 'template') {
        // 이미지나 템플릿 객체가 선택된 경우
        createColorButtons(selectedObject);
    }
}

// 색상 버튼 생성 함수
function createColorButtons(selectedObject) {
    const colorPicker = document.querySelector('.template-image-color-picker');
    colorPicker.innerHTML = ''; // 기존 버튼 제거

    commonColors.basic.forEach(color => {
        const colorButton = document.createElement('button');
        colorButton.style.backgroundColor = color;
        colorButton.style.width = '10px';
        colorButton.style.height = '10px';
        colorButton.style.border = 'none';
        colorButton.style.cursor = 'pointer';
        colorButton.addEventListener('click', () => {
            // 객체 타입에 따라 적절한 색상 변경 함수 호출
            if (selectedObject instanceof fabric.Image) {
                changeImageColor(selectedObject, color);
            } else if (selectedObject instanceof fabric.Group) {
                changeTemplateColor(selectedObject.getObjects(), color);
            }
            fabricCanvas.renderAll();
        });
        colorPicker.appendChild(colorButton);
    });
}

function updateCurrentColor(color){
    currentSelectedColor = color;
}

// 이미지 색상 변경 함수
function changeImageColor(img, color) {
    // 기존 BlendColor 필터 제거
    img.filters = img.filters.filter(filter => !(filter instanceof fabric.Image.filters.BlendColor));
    
    // 새로운 BlendColor 필터 추가
    img.filters.push(new fabric.Image.filters.BlendColor({
        color: color,
        mode: 'tint',
        alpha: 1  // 색상 적용 강도 (0~1)
    }));

    // 필터 적용
    img.applyFilters();
    return img;
}


// 템플릿 객체의 색상을 변경하는 함수
function changeTemplateColor(objects, color) {
    // console.log('Starting color change to:', color);
    // console.log('Number of objects to change:', objects.length);

    objects.forEach((obj, index) => {
        // console.log(`\nChanging object ${index + 1}:`);
        // console.log('Before change:', {
        //     type: obj.type,
        //     fill: obj.fill,
        //     stroke: obj.stroke
        // });

        const colorSettings = {
            fill: color,
            stroke: color,
            opacity: 1,
            fillOpacity: 1,
            strokeOpacity: 1,
            strokeWidth: 1,
            strokeDashArray: null,
            gradientFill: null,
            shadow: null,
            filters: []
        };

        obj.set(colorSettings);

        if (obj.fill instanceof fabric.Pattern || obj.fill instanceof fabric.Gradient) {
            console.log('Found gradient/pattern in fill, removing...');
            obj.set('fill', color);
        }
        if (obj.stroke instanceof fabric.Pattern || obj.stroke instanceof fabric.Gradient) {
            console.log('Found gradient/pattern in stroke, removing...');
            obj.set('stroke', color);
        }

        // 그룹 객체인 경우 내부 객체들도 색상 변경
        if (obj.getObjects && typeof obj.getObjects === 'function') {
            console.log('Processing group inner objects...');
            const innerObjects = obj.getObjects();
            changeTemplateColor(innerObjects, color); // 재귀적으로 내부 객체들의 색상도 변경
        }

        // console.log('After change:', {
        //     type: obj.type,
        //     fill: obj.fill,
        //     stroke: obj.stroke
        // });
    });

    // console.log('\nColor change completed');
    return objects;
}

