// 전역 변수로 fabricCanvas 선언
let fabricCanvas;

// 텍스트 추가되는 위치 변경을 위한 전역변수
let textLeft = 50;
let textTop = 20;
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
    document.getElementById('text-add').addEventListener('click', () => {
        fabricCanvas.add(new fabric.IText('텍스트',{
            left: textLeft,
            top: textTop,
            fontSize: 20,
            fill: 'black',
            fontFamily: 'Arial',
            editable: true        // 텍스트 직접 수정 가능
        }));
        // 다음 텍스트를 위해 위치 업데이트
        textLeft += 10;
        textTop += 8;

   
    });

    // 테스트를 위한 도형 추가
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
    // 모달 관련 기본 설정
    const modal = document.getElementById('templateModal');
    const btn = document.getElementById('template-btn');
    const span = document.getElementsByClassName('close')[0];
    const templateItems = document.querySelectorAll('.template-item');

    // 템플릿 버튼 클릭시 모달 열기
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // X 버튼 클릭시 모달 닫기
    span.onclick = function() {
        modal.style.display = "none";
    }

    // 모달 외부 클릭시 닫기
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

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
        const pageButtons = document.querySelectorAll('.page-btn');
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

        // X 버튼 이벤트 
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = function() {
            modal.style.display = "none";
            };
        }
    }

    // 상세 페이지 표시 함수
    async function showDetailPage(templateType, templateTitle) {
        // 1. 원래 모달 내용 저장
        const originalContent = document.querySelector('.modal-content').innerHTML;
    
        // 2. 새로운 모달 내용으로 변경
        const modalContent = document.querySelector('.modal-content');
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
                            
                            // 모달 닫기
                            modal.style.display = "none";
                        });
                    };
                    detailGrid.appendChild(item);
                });
            }
    
            // 페이지네이션 버튼 생성
            const pagination = document.getElementById('detailPagination');
            pagination.innerHTML = '';
            
            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement('button');
                button.className = 'page-btn';
                button.textContent = i;
                button.onclick = () => {
                    document.querySelectorAll('#detailPagination .page-btn')
                        .forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    showPage(i);
                };
                pagination.appendChild(button);
            }
    
            // 첫 페이지 표시
            if (totalPages > 0) {
                showPage(1);
                pagination.querySelector('.page-btn').classList.add('active');
            }
    
        } catch (error) {
            console.error('Error loading template images:', error);
            document.getElementById('detailGrid').innerHTML = 
                '<p style="grid-column: 1/-1; text-align: center;">Error loading templates</p>';
        }
    
        // 5. 뒤로가기 버튼 이벤트
        document.querySelector('.back-btn').onclick = function() {
            modalContent.innerHTML = originalContent;  // 원래 내용으로 복원
            setupOriginalModalEvents();  // 이벤트 리스너 다시 설정
        };
    }

    // 처음 템플릿 아이템 클릭시 이벤트 설정
    setupOriginalModalEvents();

    // 첫 페이지 버튼을 기본으로 활성화
    document.querySelector('.page-btn').classList.add('active');


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

