// 전역 변수로 fabricCanvas 선언
let fabricCanvas;
// 전역 변수로 canvasInstances 선언
let canvasInstances = {
    'outer-front': null,
    'outer-back': null,
    'inner-front': null,
    'inner-back': null
};
let currentView = 'outer-front';

// 색상,사이즈,인쇄방식과 포장방식 선택 상태를 저장하는 변수
let selectedBraceletColor = ''; // ex. 레드, 야광라임, 투명스카이 등등
let selectedSize = 'S'; // ex. S, M, L
let selectedPrintMethod = ''; // ex. silk,engraving
let selectedPackageMethod = ''; // ex. bulk,opp,opp_inner,opp_sticker


document.addEventListener('DOMContentLoaded', function() {
    // Fabric.js 캔버스 초기화
    fabricCanvas = new fabric.Canvas('activeCanvas', {
        width: 0,  // 초기 크기는 0으로 설정
        height: 0
    });

    // 색상 버튼 이벤트 설정
    setupColorButtonEvents(fabricCanvas);
    
    // 각 면의 canvas 인스턴스 초기화
    Object.keys(canvasInstances).forEach(view => {
        canvasInstances[view] = new fabric.Canvas(null);
    });

    /**
     * canvas 영역 테두리 on/off
     */
    // 초기 테두리 설정
    const lowerCanvas = fabricCanvas.lowerCanvasEl;
    lowerCanvas.style.border = '3px dashed #f10909ce';  // 초기 테두리 표시

    // 테두리 on/off 버튼 이벤트
    document.getElementById('onOffBtn').addEventListener('change', function() {
        const areaText = document.querySelector('.area-text');
        const lowerCanvas = fabricCanvas.lowerCanvasEl;
        
        // 체크박스 상태에 따라 테두리 토글
        if (!this.checked) {
            lowerCanvas.style.border = '';  // 테두리 제거
            areaText.style.display = 'none';
        } else {
            lowerCanvas.style.border = '3px dashed #f10909ce';  // 테두리 추가
            areaText.style.display = '';
        }
    });

    /**
     * 색상 변경에 대한 js
     */
    window.braceletImage = document.getElementById('braceletImage');
    const colorPicker = document.getElementById('colorPicker');
    
    // SVG 내용 로드
    fetch(braceletImage.src)
    .then(response => response.text())
    .then(svgContent => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
        braceletImage.parentNode.replaceChild(svgDoc.documentElement, braceletImage);

        // SVG 요소에 ID 추가
        const svgElement = document.querySelector('#bracelet svg');
        svgElement.id = 'braceletSVG';
        
        // 초기 크기를 S 사이즈로 설정
        resizeBracelet('s');

        // 초기 색상 (#00b7e9) 적용
        changeBraceletColor('#00b7e9');

        // commonColors를 사용하여 색상 버튼 생성
        Object.entries({
            normal: commonColors.basic,
            glow: commonColors.glow,
            transparent: commonColors.transparent
        }).forEach(([category, categoryColors]) => {
            const container = document.querySelector(`.color-grid.${category}`);
            if (container) {
                categoryColors.forEach((colorObj, index) => {
                    const colorButton = document.createElement('button');
                    colorButton.className = 'color_selection_btn w-button';
                    colorButton.style.backgroundColor = colorObj.color;
                    
                    // 툴팁 추가
                    colorButton.title = colorObj.name;
                    
                    const prefix = {
                        normal: 'col_',
                        glow: 'lum_',
                        transparent: 'tp_'
                    }[category];
                    colorButton.id = `${prefix}${index + 1}`;
                    
                    // 초기 선택된 색상(#00b7e9)에 active 클래스 추가
                    if (colorObj.color === '#00b7e9') {
                        colorButton.classList.add('active');
                        // 초기 색상 이름 설정
                        selectedBraceletColor = colorObj.name;
                        document.getElementById('selectedColor').textContent = selectedBraceletColor;
                        document.getElementById('sum_selectedColor').textContent = selectedBraceletColor;
                    }
                    
                    colorButton.addEventListener('click', () => {
                        document.querySelectorAll('.color-grid button').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        colorButton.classList.add('active');
                        
                        // 선택된 색상 이름 업데이트
                        selectedBraceletColor = colorObj.name;
                        changeBraceletColor(colorObj.color);
                        
                        // 색상 이름 업데이트
                        document.getElementById('selectedColor').textContent = selectedBraceletColor;
                        document.getElementById('sum_selectedColor').textContent = selectedBraceletColor;

                        // 선택된 색상 로그 출력
                        // console.log('선택된 색상:', selectedBraceletColor);
                    });
                    
                    container.appendChild(colorButton);
                });
            }
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
        
        // 사이즈 텍스트 업데이트 - 전역 변수 selectedSize 활용
        const sizeText = document.getElementById('sum_selectedSize');
        if (sizeText) {
            sizeText.textContent = `${selectedSize}사이즈`;
        }
    }
    
    // 초기 S 사이즈 버튼에 active 클래스 추가 및 텍스트 설정
    document.getElementById('size_S').classList.add('active');
    document.getElementById('sum_selectedSize').textContent = 'S사이즈';

    // 크기 변경 버튼 이벤트 리스너 추가
    document.getElementById('size_S').addEventListener('click', () => {
        updateSizeButtonState('size_S');
        selectedSize = 'S';
        // console.log('선택된 사이즈:', selectedSize);
        resizeBracelet('s');
    });
    document.getElementById('size_M').addEventListener('click', () => {
        updateSizeButtonState('size_M');
        selectedSize = 'M';
        // console.log('선택된 사이즈:', selectedSize);
        resizeBracelet('m');
    });
    document.getElementById('size_L').addEventListener('click', () => {
        updateSizeButtonState('size_L');
        selectedSize = 'L';
        // console.log('선택된 사이즈:', selectedSize);
        resizeBracelet('l');
    });

    
    // /*
    // *테스트를 위한 도형 추가
    // */
    // fabricCanvas.add(new fabric.Circle({
    //     radius: 20,
    //     fill: 'red',
    //     left: 50,
    //     top: 20
    // }));

    
    // // fabricCanvas.add(text);
    // fabricCanvas.renderAll();

     /**
     * 팔찌 뷰 전환에 대한 js
     */
     const viewButtons = document.querySelectorAll('#viewButtons button');
     
     viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (window.historyManager) {
                const previousView = currentView;
                const newView = this.dataset.view;

                console.log('=== 뷰 변경 시작 ===');
                console.log('이전 뷰:', previousView);
                console.log('새로운 뷰:', newView);

                // 현재 상태를 저장하고 뷰 변경을 실행
                window.historyManager.recordState(() => {
                    // 현재 상태 저장
                    saveCurrentCanvasState();
                    
                    // 뷰 변경 실행
                    fabricCanvas.clear();
                    viewButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    currentView = newView;
                    updateLayerPanel(currentView);

                    // SVG 이미지 업데이트
                    switch(newView) {
                        case 'outer-front':
                        case 'outer-back':
                            changeSVGImage('images/bracelet.svg');
                            break;
                        case 'inner-front':
                        case 'inner-back':
                            changeSVGImage('images/braceletInner.svg');
                            break;
                    }

                    console.log('뷰 변경 작업 완료');
                }, 'viewChange', { previousView, newView });

                console.log('=== 뷰 변경 완료 ===');
                console.log('Undo 스택:', window.historyManager.undoStack);
                console.log('Redo 스택:', window.historyManager.redoStack);
            }
        });
    });
    // SVG 이미지 변경 및 상태 복원 함수
    // window.changeSVGImage = function(src) {
    //     braceletImage.src = src;
        
    //     fetch(src)
    //         .then(response => response.text())
    //         .then(svgContent => {
    //             const parser = new DOMParser();
    //             const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    //             const oldSvg = document.querySelector('#braceletSVG');
    //             if (oldSvg) {
    //                 oldSvg.parentNode.replaceChild(svgDoc.documentElement, oldSvg);
    //                 const newSvg = document.querySelector('svg');
    //                 newSvg.id = 'braceletSVG';
                    
    //                 // 현재 선택된 사이즈 유지
    //                 const activeButton = document.querySelector('#sizepicker button.active');
    //                 const currentSize = activeButton ? activeButton.id.split('_')[1].toLowerCase() : 's';
    //                 resizeBracelet(currentSize);
    
    //                 // 현재 선택된 색상 유지
    //                 const activeColorButton = document.querySelector('#colorPicker button.active');
    //                 if (activeColorButton) {
    //                     const currentColor = activeColorButton.style.backgroundColor;
    //                     changeBraceletColor(rgbToHex(currentColor));
    //                 }
    
    //                 // 저장된 canvas 상태 복원
    //                 loadCanvasState();
    //             }
    //         });
    // }
    window.changeSVGImage = function(src) {
        return new Promise((resolve, reject) => {
            braceletImage.src = src;
            
            fetch(src)
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
                        const activeButton = document.querySelector('#sizepicker button.active');
                        const currentSize = activeButton ? activeButton.id.split('_')[1].toLowerCase() : 's';
                        resizeBracelet(currentSize);
        
                        // 현재 선택된 색상 유지
                        const activeColorButton = document.querySelector('#colorPicker button.active');
                        if (activeColorButton) {
                            const currentColor = activeColorButton.style.backgroundColor;
                            changeBraceletColor(rgbToHex(currentColor));
                        }
                        // 저장된 canvas 상태 복원
                        loadCanvasState();
                        resolve(); // SVG 변경 작업 완료
                    }
                })
                .catch(reject);
        });
    }

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
    
    // 캔버스에 추가되는 객체에 고유 ID 생성
    function generateUniqueId() {
        // uuid 모듈을 사용하여 고유 ID 생성
        return uuid.v4();
    }

    // 객체가 캔버스에 추가될 때마다 실행 
    fabricCanvas.on('object:added', function(e) {
        const obj = e.target; // e.target = 캔버스에 새로 추가된 객체
        
        // 객체에 고유 ID가 없는 경우에만 새 레이어 생성
        if (!obj.id) {
            obj.id = generateUniqueId();  
            const layer = createLayerItem(obj, layerInstances[currentView].length + 1);
            const layerContent = document.querySelector('#layer-content');
            layerContent.appendChild(layer.element);
        }
        
        // Update layer indices
        updateLayerIndices();
    });

    // 할인가격표 툴팁
    // const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    // const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    //     return new bootstrap.Popover(popoverTriggerEl, {
    //     container: 'body'
    //     })
    // })
    const tooltipContent = `
        <div class="price-tooltip-table">
            <table>
                <caption>할인가격표</caption>
                <thead>
                    <tr>
                        <th>주문 수량(개)</th>
                        <th>50</th>
                        <th>100</th>
                        <th>150</th>
                        <th>200</th>
                        <th>250</th>
                        <th>300</th>
                        <th>400</th>
                        <th>500</th>
                        <th>700</th>
                        <th>1,000</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>실크인쇄 외부단면</td>
                        <td>1,300</td>
                        <td>980</td>
                        <td>950</td>
                        <td>880</td>
                        <td>850</td>
                        <td>780</td>
                        <td>680</td>
                        <td>590</td>
                        <td>570</td>
                        <td>530</td>
                    </tr>
                    <tr>
                        <td>실크인쇄 외부양면</td>
                        <td>1,450</td>
                        <td>1,230</td>
                        <td>1,200</td>
                        <td>1,110</td>
                        <td>1,080</td>
                        <td>990</td>
                        <td>870</td>
                        <td>750</td>
                        <td>730</td>
                        <td>680</td>
                    </tr>
                    <tr>
                        <td>음각인쇄</td>
                        <td>1,550</td>
                        <td>1,250</td>
                        <td>1,200</td>
                        <td>1,100</td>
                        <td>1,000</td>
                        <td>950</td>
                        <td>850</td>
                        <td>750</td>
                        <td>700</td>
                        <td>650</td>
                    </tr>
                    <tr class="packaging">
                        <td>포장단가</td>
                        <td class="price" colspan="10">벌크포장(기본)<span>+100</span>개별포장(OPP)<span>+100</span>개별OPP+스티커<span>+250</span>개별OPP+내지<span>+200</span></td>
                    </tr>
                </tbody>
            </table>
            <div class="notes">
                <ul>
                    <li>외내부인쇄를 원하시는 경우 고객센터로 문의 부탁드립니다.</li>
                    <li>모든 상품 가격은 부가세 별도 금액입니다.</li>
                    <li>주문 후 세금계산서 발행 및 현금영수증 가능합니다.</li>
                    <li>관공서의 경우 선출고 후입금 진행 가능합니다.</li>
                    <li>문의는 고객센터 032)678-0522 또는 카카오톡 채널 세이실리로 상담해 주세요.</li>
                </ul>
            </div>
        </div>
    `;
    
    const priceButton = document.querySelector('[data-bs-price-tooltip="true"]');
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerHTML = tooltipContent;
    document.body.appendChild(tooltip);

    priceButton.addEventListener('mouseenter', function(e) {
        const buttonRect = this.getBoundingClientRect();
        tooltip.style.display = 'block';
        
        // 툴팁 위치 설정
        let left = buttonRect.left + window.scrollX;
        let top = buttonRect.top + window.scrollY - tooltip.offsetHeight - 10;

        // 화면 왼쪽 경계 체크
        if (left < 0) {
            left = 0;
        }
        // 화면 오른쪽 경계 체크
        if (left + tooltip.offsetWidth > window.innerWidth) {
            left = window.innerWidth - tooltip.offsetWidth;
        }
        // 화면 위쪽 경계 체크 (위에 공간이 없으면 버튼 아래에 표시)
        if (top < 0) {
            top = buttonRect.bottom + window.scrollY + 10;
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    });

    priceButton.addEventListener('mouseleave', function(e) {
        const tooltip = document.querySelector('.custom-tooltip');
        if (!tooltip.contains(e.relatedTarget)) {
            tooltip.style.display = 'none';
        }
    });

    // 툴팁 외부 클릭시 닫기
    document.addEventListener('click', function(e) {
        if (!priceButton.contains(e.target) && !tooltip.contains(e.target)) {
            tooltip.style.display = 'none';
        }
    });

    // 인쇄방식 선택 이벤트
    document.querySelectorAll('#print_silk, #print_engraving').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // 기존 선택 제거
            document.querySelectorAll('#print_silk, #print_engraving').forEach(btn => {
                btn.classList.remove('active');
            });
            // 새로운 선택 추가
            this.classList.add('active');
            // 선택된 값 저장
            selectedPrintMethod = this.id.replace('print_', '');
            // console.log('선택된 인쇄 방식:', selectedPrintMethod); // 선택된 인쇄 방식 출력
        });
    });

    // 포장방식 선택 이벤트
    document.querySelectorAll('#wrap_bulk, #wrap_opp, #wrap_opp_inner, #wrap_opp_sticker').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // 기존 선택 제거
            document.querySelectorAll('#wrap_bulk, #wrap_opp, #wrap_opp_inner, #wrap_opp_sticker').forEach(btn => {
                btn.classList.remove('active');
            });
            // 새로운 선택 추가
            this.classList.add('active');
            // 선택된 값 저장
            selectedPackageMethod = this.id.replace('wrap_', '');
            // console.log('선택된 포장 방식:', selectedPackageMethod); // 선택된 포장 방식 출력
        });
    });

});
// Canvas 상태 저장 함수
function saveCurrentCanvasState() {
    if (currentView && fabricCanvas) {
        const currentState = fabricCanvas.toJSON(['id', 'visible', 'lockMovementX', 
            'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 
            'selectable', 'evented', 'hoverCursor', 'moveCursor', 'objectType']); 
        canvasInstances[currentView] = new fabric.Canvas(null);
        canvasInstances[currentView].loadFromJSON(currentState, function() {
        });
    }
}

// Canvas 상태 로드 함수
function loadCanvasState() {
    if (currentView && canvasInstances[currentView]) {
        
        fabricCanvas.clear();
        const savedState = canvasInstances[currentView].toJSON(['id', 'visible', 
            'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 
            'lockScalingY', 'selectable', 'evented', 'hoverCursor', 'moveCursor', 'objectType']);
        
        // 레이어 패널 초기화
        const layerContent = document.querySelector('#layer-content');
        layerContent.innerHTML = '';
        layerInstances[currentView] = [];
        
        // 상태 복원 후 콜백에서 레이어 생성
        fabricCanvas.loadFromJSON(savedState, function() {
            
            // 모든 객체의 레이어를 새로 생성
            fabricCanvas.getObjects().forEach((obj, index) => {
                
                // 잠금 상태 복원
                if (obj.lockMovementX) {
                    obj.set({
                        selectable: false,
                        evented: false,
                        hoverCursor: 'default',
                        moveCursor: 'default'
                    });
                }
                
                // 무조건 새로운 레이어 생성
                const layer = createLayerItem(obj, index + 1);
                if (layer && layer.element) {
                    layerContent.appendChild(layer.element);
                }
            });
            
            fabricCanvas.renderAll();
            updateLayerIndices();
        });
    }
}

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