// 전역 변수로 fabricCanvas 선언
let fabricCanvas;

// 텍스트 추가되는 위치 변경을 위한 전역변수
let textLeft = 50;
let textTop = 20;

// 전역 변수로 현재 선택된 텍스트 객체 저장
let currentText = null;

// 폰트 옵션 로드 함수
async function loadFontOptions() {
    try {
        // font.css 파일 가져오기
        const response = await fetch('css/font.css');
        const cssText = await response.text();
        
        // font-family 이름 추출을 위한 정규식
        const fontFamilyRegex = /font-family:\s*['"]([^'"]+)['"]/g;
        const fontSelect = document.getElementById('fontSelect');
        
        // 추출된 모든 font-family를 옵션으로 추가
        const fonts = new Set(); // 중복 제거를 위해 Set 사용
        let match;
        while ((match = fontFamilyRegex.exec(cssText)) !== null) {
            fonts.add(match[1]);
        }
        
        // 옵션 추가
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


// async function loadFontOptions() {
//     try {
//         const response = await fetch('css/font.css');
//         const cssText = await response.text();
        
//         const fontFamilyRegex = /font-family:\s*['"]([^'"]+)['"]/g;
//         const fontSelect = document.getElementById('fontSelect');
        
//         const fonts = new Set();
//         let match;
//         while ((match = fontFamilyRegex.exec(cssText)) !== null) {
//             fonts.add(match[1]);
//         }
        
//         fonts.forEach(async fontName => {
//             const option = document.createElement('option');
//             option.value = fontName;
//             option.textContent = fontName;
//             option.style.fontFamily = fontName;  // 옵션 텍스트에 해당 폰트 적용
//             fontSelect.appendChild(option);
            
//             // 폰트 미리 로드
//             try {
//                 const font = new FontFace(fontName, `url(fonts/${fontName}.ttf)`);
//                 await font.load();
//                 document.fonts.add(font);
//             } catch (err) {
//                 console.error(`폰트 로드 실패: ${fontName}`, err);
//             }
//         });

//     } catch (error) {
//         console.error('폰트 목록을 불러오는데 실패했습니다:', error);
//     }
// }

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

    /**
     * 텍스트 추가에 대한 js
     */
    // 폰트 옵션 로드
    loadFontOptions();
    
    // 텍스트 색상 버튼 생성
    createTextColorButtons();

    // 텍스트 추가 버튼 클릭 이벤트
    document.getElementById('text-add').addEventListener('click', () => {
        // 모달 초기화
        resetModalControls();
        
        const defaultColor = '#000000'; // 기본 색상 설정
        
        // 새로운 텍스트 객체 생성
        currentText = new fabric.IText('텍스트를 \n입ssss', {
            left: textLeft,
            top: textTop,
            fontSize: 20,
            fill: defaultColor,        // 기본 색상 적용
            fontFamily: '칠백삼체',
            editable: true,
            textAlign: 'center',      // 기본 가운데 정렬
            charSpacing: 0,  // 초기 자간은 0으로 설정
            lineHeight: 1
        });
        
        // 캔버스에 텍스트 추가
        fabricCanvas.add(currentText);
        fabricCanvas.setActiveObject(currentText);
        
        // 가운데 정렬 버튼 활성화
        alignButtons.forEach(id => {
            document.getElementById(id).classList.remove('active');
        });
        document.getElementById('alignCenterBtn').classList.add('active');
        
        // 기본 색상 버튼 활성화
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.getAttribute('data-color') === defaultColor) {
                btn.classList.add('selected');
            }
        });
        
        textLeft += 10;
        textTop += 8;
    });

    // 폰트 변경 이벤트
    document.getElementById('fontSelect').addEventListener('change', function() {
        if (currentText) {
            currentText.set('fontFamily', this.value);
            fabricCanvas.renderAll();
        }
    });

    // 볼드체 토글 이벤트
    document.getElementById('boldBtn').addEventListener('click', function() {
        if (currentText) {
            this.classList.toggle('active'); // 버튼 활성화/비활성화 
            currentText.set('fontWeight', this.classList.contains('active') ? 'bold' : 'normal');
            fabricCanvas.renderAll();
        }
    });

    // 이탤릭체 토글 이벤트
    document.getElementById('italicBtn').addEventListener('click', function() {
        if (currentText) {
            this.classList.toggle('active');
            currentText.set('fontStyle', this.classList.contains('active') ? 'italic' : 'normal');
            fabricCanvas.renderAll();
        }
    });

    // 밑줄 토글 이벤트
    document.getElementById('underlineBtn').addEventListener('click', function() {
        if (currentText) {
            this.classList.toggle('active');
            currentText.set('underline', this.classList.contains('active'));
            fabricCanvas.renderAll();
        }
    });

    // 텍스트 정렬 이벤트
    const alignButtons = ['alignLeftBtn', 'alignCenterBtn', 'alignRightBtn'];
    alignButtons.forEach(btnId => {
        document.getElementById(btnId).addEventListener('click', function() {
            if (currentText) {
                const alignMap = {
                    'alignLeftBtn': 'left',
                    'alignCenterBtn': 'center',
                    'alignRightBtn': 'right'
                };
                
                // 다른 정렬 버튼들의 활성화 상태 해제
                alignButtons.forEach(id => {
                    document.getElementById(id).classList.remove('active');
                });
                
                // 클릭한 버튼만 활성화
                this.classList.add('active');
                
                // 텍스트 정렬 적용
                currentText.set({
                    textAlign: alignMap[btnId]
                });
                fabricCanvas.renderAll();
            }
        });
    });

    // 자간 조절 이벤트
    document.getElementById('charSpacing').addEventListener('input', function() {
        if (currentText) {
            // input의 값은 1씩 조정되는데 charSpacing값을 1씩 조정하면 너무 변화가 없어서 input값에 10을 곱해서 적용
            const scaledValue = parseInt(this.value) * 10;
            currentText.set('charSpacing', scaledValue);
            fabricCanvas.renderAll();
        }
    });

    // 행간 조절 이벤트
    document.getElementById('lineHeight').addEventListener('input', function() {
        if (currentText) {
            
            const value = parseFloat(this.value);
            currentText.set('lineHeight', value);
            fabricCanvas.renderAll();
        }
    });

    // RGB 색상을 HEX 코드로 변환하는 함수 추가
    function rgbToHex(rgb) {
        // rgb(r, g, b) 형식에서 숫자만 추출
        const rgbArray = rgb.match(/\d+/g);
        if (!rgbArray) return rgb; // 이미 HEX 형식이면 그대로 반환

        // RGB 값을 HEX로 변환
        const r = parseInt(rgbArray[0]);
        const g = parseInt(rgbArray[1]);
        const b = parseInt(rgbArray[2]);
        
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    // 텍스트 색상 버튼 생성 함수 수정
    function createTextColorButtons() {
        const colors = [
            '#f70303', '#fd4eb5', '#f284c1', '#f2a9c4', '#ff9f2f',
            '#feed01', '#87dc29', '#f9ec90', '#0bc349', '#01c8a9',
            '#00b7e9', '#abebd3', '#2456ed', '#8f4fdb', '#4a236d',
            '#d7ccee', '#898989', '#aa967e', '#202020', '#000000'  
        ];
        
        const colorPicker = document.getElementById('textColorPicker');
        
        colors.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.className = 'color-btn';
            colorBtn.style.backgroundColor = color;
            colorBtn.setAttribute('data-color', color);
            
            // 기본 색상인 경우 선택 상태로 설정
            if (color === '#000000') {
                colorBtn.classList.add('selected');
            }
            
            colorBtn.addEventListener('click', function() {
                if (currentText) {
                    // 이전 선택된 버튼의 선택 상태 제거
                    document.querySelectorAll('.color-btn').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    
                    currentText.set('fill', color);
                    fabricCanvas.renderAll();
                }
            });
            
            colorPicker.appendChild(colorBtn);
        });
    }

    // 캔버스 객체 선택시 발생하는 이벤트
    fabricCanvas.on('selection:created', function(e) {
        // 선택된 객체가 텍스트인 경우에만 모달 표시
        const selectedObject = fabricCanvas.getActiveObject();
        if (selectedObject && selectedObject instanceof fabric.IText) { // 선택된 객체가 텍스트인 경우에만 모달 표시
            currentText = selectedObject;
            
            // 텍스트 모달 열기
            const textModal = new bootstrap.Modal(document.getElementById('textModal'));
            textModal.show();
            
            // 선택된 텍스트의 속성을 모달에 반영
            updateModalControls();
        }
    });

    // 모달 컨트롤 상태 업데이트 함수
    function updateModalControls() {
        if (currentText) {
            // 폰트 선택 상태 업데이트
            document.getElementById('fontSelect').value = currentText.fontFamily;
            
            // 스타일 버튼 상태 업데이트
            document.getElementById('boldBtn').classList.toggle('active', 
                currentText.fontWeight === 'bold');
            document.getElementById('italicBtn').classList.toggle('active', 
                currentText.fontStyle === 'italic');
            document.getElementById('underlineBtn').classList.toggle('active', 
                currentText.underline);
            
            // 정렬 버튼 상태 업데이트
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
            
            // 색상 버튼 상태 업데이트
            document.querySelectorAll('.color-btn').forEach(btn => {
                btn.classList.remove('selected');
                const btnColor = rgbToHex(btn.style.backgroundColor);
                const textColor = currentText.fill.toLowerCase();
                
                if (btnColor.toLowerCase() === textColor) {
                    btn.classList.add('selected');
                }
            });
            
            // 자간, 행간 값
            document.getElementById('charSpacing').value = currentText.charSpacing || 0;
            document.getElementById('lineHeight').value = currentText.lineHeight || 1;
        }
    }

    // 모달 초기화 함수 추가
    function resetModalControls() {
        // 폰트 선택 초기화
        document.getElementById('fontSelect').value = '';
        
        // 스타일 버튼 초기화 (볼드, 이탤릭, 밑줄)
        ['boldBtn', 'italicBtn', 'underlineBtn'].forEach(btnId => {
            document.getElementById(btnId).classList.remove('active');
        });
        
        // 정렬 버튼 초기화
        ['alignLeftBtn', 'alignCenterBtn', 'alignRightBtn'].forEach(btnId => {
            document.getElementById(btnId).classList.remove('active');
        });
        
        // 색상 버튼 초기화
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 자간, 행간 초기화
        document.getElementById('charSpacing').value = 0;
        document.getElementById('lineHeight').value = 1;
    }
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
     * 템플릿 추가에 대한 js
     */

    // 원래 모달의 이벤트 리스너들을 다시 설정하는 함수
    function setupOriginalModalEvents() {
        // 모든 템플릿 아이템에 대해 클릭 이벤트 다시 설정
        const templateItems = document.querySelectorAll('.template-item');
        templateItems.forEach(item => {
            item.onclick = function() {
                const templateType = this.dataset.template;
                const templateTitle = this.querySelector('p').textContent;
                showDetailPage(templateType, templateTitle);
            };
        });

        // 페이지네이션 버튼 이벤트 다시 설정
        const pageButtons = document.querySelectorAll('.page-dot');
        const templatePages = document.querySelectorAll('.template-page');
        pageButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pageNum = button.dataset.page;
                templatePages.forEach(page => {
                    page.style.display = 'none';
                });
                document.querySelector(`.template-page[data-page="${pageNum}"]`).style.display = 'grid';
                pageButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

    
    }

    // 상세 페이지 표시 함수
    async function showDetailPage(templateType, templateTitle) {
        // 1. 템플릿 모달의 content를 찾습니다.
        const templateModal = document.getElementById('templateModal');
        const modalContent = templateModal.querySelector('.modal-content');
        
        // 1-1. 원래 모달 내용 저장
        const originalContent = modalContent.innerHTML;

        // 2. 새로운 모달 내용으로 변경
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>${templateTitle}</h2>
                <button class="back-btn">← 뒤로가기</button>
            </div>
            <div class="detail-template-grid" id="detailGrid"></div>
            <div class="pagination" id="detailPagination"></div>
        `;
    
        // 3. SVG 파일 로드
        try {
            const templatePath = `templates/${templateType}/`;  // 경로 설정
            const response = await fetch(templatePath);         // 폴더 내용 가져오기
            const files = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(files, 'text/html');
            const images = Array.from(doc.querySelectorAll('a'))
                .filter(a => a.href.match(/\.svg$/i))  // SVG 파일만 필터링
                .map(a => a.href);
    
            // 4. 페이지네이션 처리
            const itemsPerPage = 16;  // 한 페이지당 16개 이미지
            const totalPages = Math.ceil(images.length / itemsPerPage);
            
            // 페이지 표시 함수
            function showPage(pageNum) {
                const start = (pageNum - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const pageImages = images.slice(start, end);  // 현재 페이지에 표시할 이미지들
                
                const detailGrid = document.getElementById('detailGrid');
                detailGrid.innerHTML = '';
                
                // 이미지 그리드 생성
                pageImages.forEach(imgSrc => {
                    const item = document.createElement('div');
                    item.className = 'detail-template-item';
                    item.innerHTML = `<img src="${imgSrc}" alt="템플릿 이미지">`;
                    item.onclick = () => {
                        // SVG 이미지를 Fabric Canvas에 추가
                        fabric.loadSVGFromURL(imgSrc, function(objects, options) {
                            const loadedObject = fabric.util.groupSVGElements(objects, options);
                            
                            // 이미지 크기 조정 (필요한 경우)
                            loadedObject.scaleToWidth(50);  // 원하는 크기로 조정
                            
                            // 이미지 위치 설정
                            loadedObject.set({
                                left: fabricCanvas.width / 2 - loadedObject.width * loadedObject.scaleX / 2, /**이미지가 가운데 뜨게 설정 */
                                top: fabricCanvas.height / 2 - loadedObject.height * loadedObject.scaleY / 2,
                                selectable: true,  // 선택 가능하도록 설정
                                evented: true      // 이벤트 활성화
                            });
                            
                            // Canvas에 추가
                            fabricCanvas.add(loadedObject);
                            fabricCanvas.renderAll();
                            
                             // 부트스트랩 모달 인스턴스를 가져와서 닫기
                            const templateModal = document.getElementById('templateModal');
                            const modal = bootstrap.Modal.getInstance(templateModal);
                            modal.hide();
                        });
                    };
                    detailGrid.appendChild(item);
                });
            }
    
            // 페이지네이션 버튼 생
            const pagination = document.getElementById('detailPagination');
            pagination.innerHTML = '';
            
            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement('button');
                button.className = 'page-dot';
                button.setAttribute('data-page', i);
                button.onclick = () => {
                    document.querySelectorAll('#detailPagination .page-dot')
                        .forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    showPage(i);
                };
                pagination.appendChild(button);
            }
    
            // 첫 페이지 표시
            if (totalPages > 0) {
                showPage(1);
                pagination.querySelector('.page-dot').classList.add('active');
            }
    
        } catch (error) {
            console.error('Error loading template images:', error);
            document.getElementById('detailGrid').innerHTML = 
                '<p style="grid-column: 1/-1; text-align: center;">Error loading templates</p>';
        }
    
        // 5. 뒤로가기 버튼 이벤트
        modalContent.querySelector('.back-btn').onclick = function() {
            modalContent.innerHTML = originalContent;  // 원래 내용으로 복원
            setupOriginalModalEvents();  // 이벤트 리스너 다시 설정
        };
    }

    // 처음 템플릿 아이템 클릭시 이벤트 설정
    setupOriginalModalEvents();

    // 첫 페이지 버튼을 기본으로 활성화
    document.querySelector('.page-dot').classList.add('active');


   

});

// 모달 외부 클릭 시 닫기 이벤트 추가
document.addEventListener('click', function(event) {
    const textModal = document.getElementById('textModal');
    const templateModal = document.getElementById('templateModal');
    
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
});