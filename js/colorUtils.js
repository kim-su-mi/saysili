// 전역 변수로 현재 선택된 색상 저장
let currentSelectedColor = '#ffffff'; // 기본값 흰색

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