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
        height: 0,
        // backgroundColor: 'transparent' // 캔버스 배경을 투명하게 설정
        preserveObjectStacking: true
    });

    // 색상 버튼 이벤트 설정
    setupColorButtonEvents(fabricCanvas);
    
    // 각 면의 canvas 인스턴스 초기화
    Object.keys(canvasInstances).forEach(view => {
        canvasInstances[view] = new fabric.Canvas(null);
    });

    // SVG를 캔버스 배경으로 로드하는 함수
    function loadSVGBackground(svgUrl) {
        // SVG 파일을 텍스트로 가져오기
        fetch(svgUrl)
            .then(response => response.text())
            .then(svgContent => {
                // SVG 문자열을 DOM 요소로 파싱
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
                const svgElement = svgDoc.documentElement;

                // SVG를 문자열로 변환하여 data URL 생성
                const serializer = new XMLSerializer();
                const svgString = serializer.serializeToString(svgElement);
                const svgBlob = new Blob([svgString], {type: 'image/svg+xml'});
                const url = URL.createObjectURL(svgBlob);

                // Fabric.js로 SVG 로드
                fabric.loadSVGFromURL(url, function(objects, options) {
                    const svgGroup = fabric.util.groupSVGElements(objects, options);
                    
                    // SVG 그룹을 배경 이미지로 설정
                    fabricCanvas.setBackgroundImage(svgGroup, fabricCanvas.renderAll.bind(fabricCanvas), {
                        scaleX: fabricCanvas.width / svgGroup.width,
                        scaleY: fabricCanvas.height / svgGroup.height
                    });
                    
                    // 클리핑 영역 생성 (캔버스 크기의 85% x 75%)
                    const clipWidth = fabricCanvas.width * 0.85;
                    const clipHeight = fabricCanvas.height * 0.75;
                    
                    // 클리핑 패스를 위한 rect 생성
                    const clipPath = new fabric.Rect({
                        left: (fabricCanvas.width - clipWidth) / 2,
                        top: (fabricCanvas.height - clipHeight) / 2,
                        width: clipWidth,
                        height: clipHeight,
                        absolutePositioned: true
                    });

                    // 클리핑 패스는 객체에만 적용
                    fabricCanvas.on('object:added', function(e) {
                        if (!e.target.isBackground) {
                            e.target.clipPath = clipPath;
                        }
                    });

                    // Blob URL 해제
                    URL.revokeObjectURL(url);
                    fabricCanvas.renderAll();
                });
            });
    }

    // SVG 내용 로드 및 초기 설정
    fetch('images/bracelet.svg')
    .then(response => response.text())
    .then(svgContent => {
        // 초기 크기를 S 사이즈로 설정
        resizeBracelet('s');

        // 초기 색상 (#00b7e9) 적용
        changeBraceletColor('#00b7e9');
        console.log('초기 색상 파란색 적용');
        
        // 주석 처리 또는 제거
        // loadSVGBackground('images/bracelet.svg');

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
    function changeBraceletColor(baseColor) {
        console.log('changeBraceletColor 함수 호출',baseColor);
        const currentSvgUrl = currentView.startsWith('inner') ? 'images/braceletInner.svg' : 'images/bracelet.svg';
        
        fetch(currentSvgUrl)
            .then(response => response.text())
            .then(svgContent => {
                // SVG 문자열을 DOM 요소로 파싱
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
                const svgElement = svgDoc.documentElement;

                // 외부 팔찌용 그라디언트 ID들
                const outerGradients = [
                    '_무제_그라디언트_95',
                    '_무제_그라디언트_92',
                    '_무제_그라디언트_78'
                ];
        
                // bracelet.svg 그라디언트 업데이트
                outerGradients.forEach((gradientId, index) => {
                    const gradient = svgDoc.getElementById(gradientId);
                    if (gradient) {
                        const stops = gradient.getElementsByTagName('stop');
                        const adjustment = [-20, 0, -40][index];
        
                        for (let stop of stops) {
                            stop.setAttribute('stop-color', adjustColor(baseColor, adjustment));
                        }
                    }
                });
        
                // braceletInner.svg용 그라디언트 업데이트
                const innerGradient = svgDoc.getElementById('_무제_그라디언트_78');
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
                        const stop = svgDoc.createElementNS("http://www.w3.org/2000/svg", "stop");
                        stop.setAttribute("offset", offset);
                        stop.setAttribute("stop-color", adjustColor(baseColor, adjustment));
                        innerGradient.appendChild(stop);
                    });
                }
        
                // 두 번째 그라디언트 업데이트 (무제_그라디언트_95-2)
                const gradient2 = svgDoc.getElementById('_무제_그라디언트_95-2');
                if (gradient2) {
                    const stops = gradient2.getElementsByTagName('stop');
                    for (let stop of stops) {
                        stop.setAttribute('stop-color', adjustColor(baseColor, -20));
                    }
                }

                // SVG를 문자열로 변환
                const serializer = new XMLSerializer();
                const modifiedSvgString = serializer.serializeToString(svgElement);
                const svgBlob = new Blob([modifiedSvgString], {type: 'image/svg+xml'});
                const url = URL.createObjectURL(svgBlob);

                // 수정된 SVG를 캔버스 배경으로 설정
                fabric.loadSVGFromURL(url, function(objects, options) {
                    const svgGroup = fabric.util.groupSVGElements(objects, options);
                    fabricCanvas.setBackgroundImage(svgGroup, fabricCanvas.renderAll.bind(fabricCanvas), {
                        scaleX: fabricCanvas.width / svgGroup.width,
                        scaleY: fabricCanvas.height / svgGroup.height
                    });

                    // Blob URL 해제
                    URL.revokeObjectURL(url);
                    fabricCanvas.renderAll();
                });
            });
    }

    /**
     * 크기 변경에 대한 js
     */

    function resizeBracelet(size) {
        // canvas_div의 가로 길이를 기준으로 설정
        const canvasDiv = document.querySelector('.canvas_div');
        const canvasDivWidth = canvasDiv.offsetWidth;
        
        // 기준이 되는 S사이즈의 높이를 먼저 계산
        const baseHeight = canvasDivWidth * 0.5 * 0.15; // S사이즈 너비(50%)의 13%

        const sizes = {
            's': { 
                widthPercent: 0.5,  // canvas_div 너비의 50%
                height: baseHeight,  // 모든 사이즈가 동일한 높이 사용
                printSize: '65 x 8mm'
            },
            'm': { 
                widthPercent: 0.55,  // canvas_div 너비의 60%
                height: baseHeight,  // S사이즈와 동일한 높이
                printSize: '75 x 8mm'
            },
            'l': { 
                widthPercent: 0.6,  // canvas_div 너비의 70%
                height: baseHeight,  // S사이즈와 동일한 높이
                printSize: '80 x 8mm'
            }
        };

        const newSize = sizes[size];
        if (newSize) {
            // 사이즈에 따른 selectedSize 업데이트
            selectedSize = size.toUpperCase();
            document.getElementById('sum_selectedSize').textContent = `${selectedSize}사이즈`;

            // canvas_div 너비에 따른 캔버스 크기 계산
            const canvasWidth = canvasDivWidth * newSize.widthPercent;
            const canvasHeight = newSize.height;  // 모든 사이즈가 동일한 높이 사용

            fabricCanvas.setWidth(canvasWidth);
            fabricCanvas.setHeight(canvasHeight);
            fabricCanvas.setDimensions({
                width: canvasWidth,
                height: canvasHeight
            });

            // 현재 선택된 색상 버튼 찾기
            const activeColorButton = document.querySelector('.color_selection_btn.active');
            const currentColor = activeColorButton ? window.getComputedStyle(activeColorButton).backgroundColor : '#00b7e9';
            console.log('currentColor',currentColor);

            // 현재 뷰에 따른 SVG 파일 결정
            const svgPath = currentView.startsWith('inner') ? 'images/braceletInner.svg' : 'images/bracelet.svg';
            
            // 배경 SVG 로드 후 현재 색상 적용
            loadSVGBackground(svgPath);
            changeBraceletColor(rgbToHex(currentColor));
            console.log('changeBraceletColor 함수 호출22',rgbToHex(currentColor));

            // 인쇄 가능 영역 크기 표시 업데이트
            const printableAreaSpan = document.querySelector('.printable-area span');
            if (printableAreaSpan) {
                const existingText = printableAreaSpan.textContent.split('-')[0];
                printableAreaSpan.textContent = `${existingText}- ${newSize.printSize}`;
            }    
        }
    }

    // 창 크기가 변경될 때마다 현재 선택된 사이즈로 리사이즈
    window.addEventListener('resize', () => {
        const activeButton = document.querySelector('#sizepicker button.active');
        if (activeButton) {
            const currentSize = activeButton.id.split('_')[1].toLowerCase();
            resizeBracelet(currentSize);
        }
    });

    // 사이즈 버튼 상태 업데이트 함수
    function updateSizeButtonState(activeId) {
        ['size_S', 'size_M', 'size_L'].forEach(id => {
            document.getElementById(id).classList.remove('active');
        });
        document.getElementById(activeId).classList.add('active');
        
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
                    viewButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    currentView = newView;

                    // 캔버스 초기화 전에 기존 객체들 임시 저장
                    const currentObjects = fabricCanvas.getObjects();
                    
                    fabricCanvas.clear();
                    updateLayerPanel(currentView);

                    // SVG 이미지 업데이트 후 상태 복원
                    const svgPath = newView.startsWith('inner') ? 'images/braceletInner.svg' : 'images/bracelet.svg';
                    
                    changeSVGImage(svgPath).then(() => {
                        // 이전 뷰의 상태 복원
                        if (canvasInstances[newView]) {
                            loadCanvasState();
                        } else {
                            // 새로운 뷰의 경우 빈 캔버스 상태로 초기화
                            canvasInstances[newView] = new fabric.Canvas(null);
                        }
                        fabricCanvas.renderAll();
                    });

                    console.log('뷰 변경 작업 완료');
                }, 'viewChange', { previousView, newView });

                console.log('=== 뷰 변경 완료 ===');
                console.log('Undo 스택:', window.historyManager.undoStack);
                console.log('Redo 스택:', window.historyManager.redoStack);
            }
        });
    });
    // SVG 이미지 변경 및 상태 복원 함수
    window.changeSVGImage = function(src) {
        return new Promise((resolve, reject) => {
            // 현재 선택된 사이즈 유지
            const activeButton = document.querySelector('#sizepicker button.active');
            const currentSize = activeButton ? activeButton.id.split('_')[1].toLowerCase() : 's';
            
            // 현재 선택된 색상 유지
            const activeColorButton = document.querySelector('#colorPicker button.active');
            const currentColor = activeColorButton ? rgbToHex(activeColorButton.style.backgroundColor) : '#00b7e9';

            // SVG를 캔버스 배경으로 로드하고, 완료 후 캔버스 상태 복원
            fabric.loadSVGFromURL(src, function(objects, options) {
                const svgGroup = fabric.util.groupSVGElements(objects, options);
                
                fabricCanvas.setBackgroundImage(svgGroup, function() {
                    fabricCanvas.renderAll();
                    
                    // 사이즈와 색상 적용
                    resizeBracelet(currentSize);
                    changeBraceletColor(currentColor);
                    
                    // 배경 이미지 로드 완료 후 저장된 canvas 상태 복원
                    loadCanvasState();
                    
                    resolve();
                }, {
                    scaleX: fabricCanvas.width / svgGroup.width,
                    scaleY: fabricCanvas.height / svgGroup.height
                });
            });
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

    // 인쇄 가능 영역 토글 버튼 이벤트 리스너
    const onOffBtn = document.getElementById('onOffBtn');
    const printableArea = document.querySelector('.printable-area');
    
    onOffBtn.addEventListener('change', function() {
        if (this.checked) {
            // ON 상태 - 인쇄 가능 영역 표시
            printableArea.classList.remove('hide-print-area');
        } else {
            // OFF 상태 - 인쇄 가능 영역 숨김
            printableArea.classList.add('hide-print-area');
        }
    });

});
// Canvas 상태 저장 함수
function saveCurrentCanvasState() {
    if (currentView && fabricCanvas) {
        const currentState = fabricCanvas.toJSON(['id', 'visible', 'lockMovementX', 
            'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 
            'selectable', 'evented', 'hoverCursor', 'moveCursor', 'objectType']);
        
        // 현재 뷰의 상태를 저장
        canvasInstances[currentView] = new fabric.Canvas(null);
        canvasInstances[currentView].loadFromJSON(currentState, function() {
            console.log(`Saved state for view: ${currentView}`);
        });
    }
}

// Canvas 상태 로드 함수
function loadCanvasState() {
    if (currentView && canvasInstances[currentView]) {
        const savedState = canvasInstances[currentView].toJSON(['id', 'visible', 
            'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 
            'lockScalingY', 'selectable', 'evented', 'hoverCursor', 'moveCursor', 'objectType']);
        
        // 레이어 패널 초기화
        const layerContent = document.querySelector('#layer-content');
        layerContent.innerHTML = '';
        layerInstances[currentView] = [];
        
        // 클리핑 패스 설정
        const clipWidth = fabricCanvas.width * 0.85;
        const clipHeight = fabricCanvas.height * 0.75;
        const clipPath = new fabric.Rect({
            left: (fabricCanvas.width - clipWidth) / 2,
            top: (fabricCanvas.height - clipHeight) / 2,
            width: clipWidth,
            height: clipHeight,
            absolutePositioned: true
        });
        
        // 상태 복원 후 콜백에서 레이어 생성
        fabricCanvas.loadFromJSON(savedState, function() {
            fabricCanvas.getObjects().forEach((obj) => {
                if (!obj.isBackground) {
                    obj.clipPath = clipPath;
                }
                
                // 레이어 생성
                const layer = createLayerItem(obj, layerInstances[currentView].length + 1);
                if (layer && layer.element) {
                    layerContent.appendChild(layer.element);
                }
            });
            
            console.log(`Loaded state for view: ${currentView}`);
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