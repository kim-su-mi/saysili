// 공통으로 사용할 색상 리스트 정의
const commonColors = {
    basic: [
        { color: '#f70303', name: '레드' },
        { color: '#fd4eb5', name: '형광핑크' },
        { color: '#f284c1', name: '핑크' },
        { color: '#f2a9c4', name: '파스텔핑크' },
        { color: '#ff9f2f', name: '오렌지' },
        { color: '#feed01', name: '옐로우' },
        { color: '#87dc29', name: '스프링그린' },
        { color: '#f9ec90', name: '레몬' },
        { color: '#0bc349', name: '그린' },
        { color: '#01c8a9', name: '에메랄드' },
        { color: '#00b7e9', name: '스카이' },
        { color: '#abebd3', name: '민트' },
        { color: '#2456ed', name: '다크블루' },
        { color: '#8f4fdb', name: '퍼플' },
        { color: '#4a236d', name: '다크퍼플' },
        { color: '#d7ccee', name: '라벤더' },
        { color: '#898989', name: '쿨그레이' },
        { color: '#aa967e', name: '베이지' },
        { color: '#000000', name: '블랙' },
        { color: '#ffffff', name: '화이트' }
    ],
    // 야광
    glow: [
        { color: '#fa9529', name: '야광오렌지' },
        { color: '#fbf666', name: '야광옐로우' },
        { color: '#54e669', name: '야광그린' },
        { color: '#d6e00d', name: '야광라임' },
        { color: '#fbc9d4', name: '야광핑크' },
        { color: '#fac79c', name: '야광살구' },
        { color: '#c6f5b1', name: '야광메론' },
        { color: '#b5ebd1', name: '야광민트' },
        { color: '#1896e3', name: '야광블루' },
        { color: '#9473c2', name: '야광퍼플' }
    ],
    // 투명
    transparent: [
        { color: '#ebebeb', name: '투명화이트' },
        { color: '#f6cfd2', name: '투명핑크' },
        { color: '#d7edfa', name: '투명스카이' },
        { color: '#e3f1da', name: '투명그린' },
        { color: '#ecdff3', name: '투명퍼플' }
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
    fabricCanvas.on('selection:cleared', handleSelectionCleared);
}

// 객체 선택 했을 때 색상 버튼 생성하는 함수
function handleObjectSelection(e) {
    const selectedObject = e.selected[0];
    const colorPicker = document.querySelector('.template-image-color-picker');
    const colorEditPanel = document.querySelector('.mainpanel_wrapper.color-edit');
    const mainPanel = document.querySelector('.mainpanel_wrapper:not(.color-edit)');
    const backBtn = document.querySelector('.color-edit-back-btn');
    
    if (selectedObject instanceof fabric.IText) {
        // 텍스트 객체가 선택된 경우
        colorPicker.innerHTML = ''; // 색상 버튼 제거
        
        // 색상 편집 패널 숨기기
        if (colorEditPanel) {
            colorEditPanel.classList.remove('active');
        }
        if (mainPanel) {
            mainPanel.style.display = 'block';
        }
        
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
        
        // 메인 패널 숨기기
        if (mainPanel) {
            mainPanel.style.display = 'none';
        }
        
        // 색상 편집 패널 표시
        if (colorEditPanel) {
            colorEditPanel.classList.add('active');
        }
        
        // 색상 버튼 생성
        createColorButtons(selectedObject);
        
        // 뒤로가기 버튼 이벤트 리스너 추가
        if (backBtn) {
            backBtn.onclick = function() {
                // 색상 편집 패널 숨기기
                if (colorEditPanel) {
                    colorEditPanel.classList.remove('active');
                }
                
                // 메인 패널 다시 표시
                if (mainPanel) {
                    mainPanel.style.display = 'block';
                }
                
                // 객체 선택 해제
                fabricCanvas.discardActiveObject();
                fabricCanvas.renderAll();
            };
        }
    }
}

// 객체 선택 해제 시 처리하는 함수 추가
function handleSelectionCleared() {
    const colorPicker = document.querySelector('.template-image-color-picker');
    const colorEditPanel = document.querySelector('.mainpanel_wrapper.color-edit');
    const mainPanel = document.querySelector('.mainpanel_wrapper:not(.color-edit)');
    
    colorPicker.innerHTML = ''; // 색상 버튼 제거
    
    // 색상 편집 패널 숨기기
    if (colorEditPanel) {
        colorEditPanel.classList.remove('active');
    }
    
    // 메인 패널 다시 표시
    if (mainPanel) {
        mainPanel.style.display = 'block';
    }
}

// 색상 버튼 생성 함수(템플릿,이미지)
function createColorButtons(selectedObject) {
    const colorPicker = document.querySelector('.template-image-color-picker');
    colorPicker.innerHTML = ''; // 기존 버튼 제거

    commonColors.basic.forEach(colorObj => {
        const colorButton = document.createElement('button');
        colorButton.style.backgroundColor = colorObj.color;
        colorButton.style.width = '20px';
        colorButton.style.height = '20px';
        colorButton.style.border = 'none';
        colorButton.style.cursor = 'pointer';
        colorButton.style.margin = '2px';
        
        if (colorObj.color === currentSelectedColor) {
            colorButton.style.border = '2px solid #000';
        }
        
        colorButton.addEventListener('click', () => {
            // 히스토리 매니저를 통해 상태 변경 기록
            if (window.historyManager) {
                window.historyManager.recordState(() => {
                    // 모든 버튼의 테두리 초기화
                    const allButtons = colorPicker.querySelectorAll('button');
                    allButtons.forEach(btn => {
                        btn.style.border = 'none';
                    });
                    
                    // 클릭된 버튼에 테두리 추가
                    colorButton.style.border = '2px solid #000';
                    
                    // 색상 변경 실행
                    changeAllObjectsColor(fabricCanvas, colorObj.color);
                });
            }
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



// 모든 캔버스 객체의 색상을 변경하는 함수
function changeAllObjectsColor(fabricCanvas, selectedColor) {
    // 현재 색상 저장
    updateCurrentColor(selectedColor);

    // 현재 활성화된 canvas의 객체들 색상 변경
    fabricCanvas.getObjects().forEach(obj => {
        if (obj instanceof fabric.IText) {
            obj.set('fill', selectedColor);
        } 
        else if (obj instanceof fabric.Image) {
            changeImageColor(obj, selectedColor);
        }
        else if (obj instanceof fabric.Group) {
            if (obj.objectType === 'template') {
                // 템플릿인 경우
                const templateObjects = obj.getObjects();
                changeTemplateColor(templateObjects, selectedColor);
            } else {
                // 일반 그룹인 경우
                changeGroupObjectsColor(obj, selectedColor);
            }
        }
    });
    fabricCanvas.renderAll();

    
    
    // 모든 뷰의 캔버스 객체들 색상 변경
    Object.values(canvasInstances).forEach(canvas => {
        if (canvas) {
            canvas.getObjects().forEach(obj => {
                if (obj instanceof fabric.IText) {
                    obj.set('fill', selectedColor);
                } 
                else if (obj instanceof fabric.Image) {
                    changeImageColor(obj, selectedColor);
                }
                else if (obj instanceof fabric.Group) {
                    if (obj.objectType === 'template') {
                        const templateObjects = obj.getObjects();
                        changeTemplateColor(templateObjects, selectedColor);
                    } else {
                        changeGroupObjectsColor(obj, selectedColor);
                    }
                }
            });
            canvas.renderAll();
        }
    });
    // 현재 뷰의 상태를 저장
    if (typeof saveCurrentCanvasState === 'function') {
        saveCurrentCanvasState();
    }
    
}

// 그룹 내 객체의 색상을 변경하는 함수
function changeGroupObjectsColor(group, selectedColor) {
    const objects = group.getObjects();
    objects.forEach(obj => {
        if (obj instanceof fabric.IText) {
            obj.set('fill', selectedColor);
        } 
        else if (obj instanceof fabric.Image) {
            changeImageColor(obj, selectedColor);
        }
        else if (obj instanceof fabric.Group) {
            // 중첩된 그룹의 경우 재귀적으로 처리
            changeGroupObjectsColor(obj, selectedColor);
        }
        else {
            // Path나 기타 기본 객체들의 경우
            obj.set({
                fill: selectedColor,
                stroke: selectedColor
            });
        }
    });
}

// 새로운 객체 추가 시 색상 설정 함수
function getInitialColor(fabricCanvas) {
    // 모든 뷰의 캔버스 객체 확인
    const hasAnyObjects = Object.values(canvasInstances).some(canvas => {
        return canvas && canvas.getObjects().length > 0;
    });
    
    // 현재 캔버스도 확인
    const currentHasObjects = fabricCanvas.getObjects().length > 0;
    
    // 모든 캔버스가 비어있을 때만 흰색 반환
    if (!hasAnyObjects && !currentHasObjects) {
        currentSelectedColor = '#ffffff';
    }
    
    // 하나라도 객체가 있으면 마지막으로 선택된 색상 반환
    return currentSelectedColor;
}