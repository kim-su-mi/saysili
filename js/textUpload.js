// 전역 변수로 현재 선택된 텍스트 객체 저장
let currentText = null;

// 텍스트 추가되는 위치 변경을 위한 전역변수
let textLeft = 50;
let textTop = 10;

// 폰트 옵션 로드 함수
async function loadFontOptions() {
    try {
        const response = await fetch('css/font.css');
        const cssText = await response.text();
        
        const fontFamilyRegex = /font-family:\s*['"]([^'"]+)['"]/g;
        const fontSelect = document.getElementById('fontSelect');
        
        const fonts = new Set();
        let match;
        while ((match = fontFamilyRegex.exec(cssText)) !== null) {
            fonts.add(match[1]);
        }
        
        fonts.forEach(fontName => {
            const option = document.createElement('option');
            option.value = fontName;
            option.textContent = fontName;
            fontSelect.appendChild(option);
        });
    } catch (error) {
        console.error('폰트 목록을 불러오는데 실패했습니다:', error);
    }
}

// RGB 색상을 HEX 코드로 변환하는 함수
function rgbToHex(rgb) {
    const rgbArray = rgb.match(/\d+/g);
    if (!rgbArray) return rgb;

    const r = parseInt(rgbArray[0]);
    const g = parseInt(rgbArray[1]);
    const b = parseInt(rgbArray[2]);
    
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// 텍스트 색상 버튼 생성 함수
function createTextColorButtons() {
    const colors = commonColors.basic;
    const colorPicker = document.getElementById('textColorPicker');
    
    colors.forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.className = 'color-btn';
        colorBtn.style.backgroundColor = color;
        colorBtn.setAttribute('data-color', color);
        
        // 현재 선택된 색상이면 표시
        if (color === currentSelectedColor) {
            colorBtn.classList.add('selected');
        }
        
        colorBtn.addEventListener('click', function() {
            // 히스토리 매니저를 통해 상태 변경 기록
            if (window.historyManager) {
                window.historyManager.recordState(() => {
                    document.querySelectorAll('.color-btn').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    
                    changeAllObjectsColor(fabricCanvas, color);
                });
            }
        });
        colorPicker.appendChild(colorBtn);
    });
}

// 모달 컨트롤 상태 업데이트 함수
function updateModalControls() {
    if (currentText) {
        document.getElementById('fontSelect').value = currentText.fontFamily;
        
        document.getElementById('boldBtn').classList.toggle('active', 
            currentText.fontWeight === 'bold');
        document.getElementById('italicBtn').classList.toggle('active', 
            currentText.fontStyle === 'italic');
        document.getElementById('underlineBtn').classList.toggle('active', 
            currentText.underline);
        
        const alignButtons = ['alignLeftBtn', 'alignCenterBtn', 'alignRightBtn'];
        alignButtons.forEach(id => {
            document.getElementById(id).classList.remove('active');
        });
        
        const alignBtnMap = {
            'left': 'alignLeftBtn',
            'center': 'alignCenterBtn',
            'right': 'alignRightBtn'
        };
        
        if (currentText.textAlign && alignBtnMap[currentText.textAlign]) {
            document.getElementById(alignBtnMap[currentText.textAlign]).classList.add('active');
        }
        
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('selected');
            const btnColor = rgbToHex(btn.style.backgroundColor);
            const textColor = currentText.fill.toLowerCase();
            
            if (btnColor.toLowerCase() === textColor) {
                btn.classList.add('selected');
            }
        });
        
        document.getElementById('charSpacing').value = currentText.charSpacing || 0;
        document.getElementById('lineHeight').value = currentText.lineHeight || 1;
    }
}

// 모달 초기화 함수
function resetModalControls() {
    document.getElementById('fontSelect').value = '';
    
    ['boldBtn', 'italicBtn', 'underlineBtn'].forEach(btnId => {
        document.getElementById(btnId).classList.remove('active');
    });
    
    ['alignLeftBtn', 'alignCenterBtn', 'alignRightBtn'].forEach(btnId => {
        document.getElementById(btnId).classList.remove('active');
    });
    
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    document.getElementById('charSpacing').value = 0;
    document.getElementById('lineHeight').value = 1;
}

// 텍스트 관련 이벤트 리스너 설정
function initializeTextEvents() {
    // 폰트 옵션 로드
    loadFontOptions();
    
    // 텍스트 색상 버튼 생성
    createTextColorButtons();

    // 텍스트 추가 버튼 클릭 이벤트
    document.getElementById('text-add').addEventListener('click', () => {
        resetModalControls();
        
        const initialColor = getInitialColor(fabricCanvas);
        
        currentText = new fabric.IText('텍^스*트我를 \n입abc력de♥하세요', {
            left: textLeft,
            top: textTop,
            fontSize: 20,
            fill: initialColor,
            fontFamily: 'Arial',
            editable: true,
            textAlign: 'center',
            charSpacing: 0,
            lineHeight: 1,
            objectType: 'text'
        });
        
        fabricCanvas.add(currentText);
        fabricCanvas.setActiveObject(currentText);
        
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.getAttribute('data-color') === initialColor) {
                btn.classList.add('selected');
            }
        });
        
        textLeft += 10;
        textTop += 2;
    });

    // 폰트 변경 이벤트
    document.getElementById('fontSelect').addEventListener('change', function() {
        if (currentText && window.historyManager) {
            window.historyManager.recordState(() => {
                currentText.set('fontFamily', this.value);
                fabricCanvas.renderAll();
            });
        }
    });

    // 볼드체 토글 이벤트
    document.getElementById('boldBtn').addEventListener('click', function() {
        if (currentText && window.historyManager) {
            window.historyManager.recordState(() => {
                this.classList.toggle('active');
                currentText.set('fontWeight', this.classList.contains('active') ? 'bold' : 'normal');
                fabricCanvas.renderAll();
            });
        }
    });

    // 이탤릭체 토글 이벤트
    document.getElementById('italicBtn').addEventListener('click', function() {
        if (currentText && window.historyManager) {
            window.historyManager.recordState(() => {
                this.classList.toggle('active');
                currentText.set('fontStyle', this.classList.contains('active') ? 'italic' : 'normal');
                fabricCanvas.renderAll();
            });
        }
    });

    // 밑줄 토글 이벤트
    document.getElementById('underlineBtn').addEventListener('click', function() {
        if (currentText && window.historyManager) {
            window.historyManager.recordState(() => {
                this.classList.toggle('active');
                currentText.set('underline', this.classList.contains('active'));
                fabricCanvas.renderAll();
            });
        }
    });

    // 텍스트 정렬 이벤트
    const alignButtons = ['alignLeftBtn', 'alignCenterBtn', 'alignRightBtn'];
    alignButtons.forEach(btnId => {
        document.getElementById(btnId).addEventListener('click', function() {
            if (currentText && window.historyManager) {
                window.historyManager.recordState(() => {
                    const alignMap = {
                        'alignLeftBtn': 'left',
                    'alignCenterBtn': 'center',
                        'alignRightBtn': 'right'
                        };
                    
                    alignButtons.forEach(id => {
                        document.getElementById(id).classList.remove('active');
                    });
                    
                    this.classList.add('active');
                    
                    currentText.set({
                        textAlign: alignMap[btnId]
                    });
                    fabricCanvas.renderAll();
                });
            }
        });
    });

    // 자간 조절 이벤트
    document.getElementById('charSpacing').addEventListener('input', function() {
        if (currentText && window.historyManager) {
            window.historyManager.recordState(() => {
                const scaledValue = parseInt(this.value) * 10;
                currentText.set('charSpacing', scaledValue);
                fabricCanvas.renderAll();
            });
        }
    });

    // 행간 조절 이벤트
    document.getElementById('lineHeight').addEventListener('input', function() {
        if (currentText && window.historyManager) {
            window.historyManager.recordState(() => {
                const value = parseFloat(this.value);
                currentText.set('lineHeight', value);
                fabricCanvas.renderAll();   
            });
        }
    });

    // 캔버스 객체 선택시 발생하는 이벤트
    fabricCanvas.on('selection:created', function(e) {
        const selectedObject = fabricCanvas.getActiveObject();
        if (selectedObject && selectedObject instanceof fabric.IText) {
            currentText = selectedObject;
            
            const textModal = new bootstrap.Modal(document.getElementById('textModal'));
            textModal.show();
            
            updateModalControls();
        }
    });
}

// // DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', initializeTextEvents);