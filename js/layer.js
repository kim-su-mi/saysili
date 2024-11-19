// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    const layerPanel = document.querySelector('.layer-panel');
    const toggleBtn = layerPanel.querySelector('.toggle-btn');
    const layerContent = layerPanel.querySelector('.layer-content');
    
    // 레이어 패널 접기/펼치기 토글 기능
    toggleBtn.addEventListener('click', function() {
        layerPanel.classList.toggle('collapsed');// 패널 접힘/펼침 클래스 토글
        layerContent.classList.toggle('show');// 레이어 컨텐츠 표시/숨김 클래스 토글
    });

    // 전역에서 접근 가능하도록 window 객체에 함수 등록
    // fabricCanvas에서 객체가 추가될 때 이 함수를 호출
    window.createLayerItem = function(obj, index) {
        // 새로운 레이어 아이템 요소 생성
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.dataset.objectId = obj.id; // fabric 객체의 ID를 데이터 속성으로 저장, 레이어와 캔버스 객체를 연결

        layerItem.innerHTML = `
            <div class="layer-info">
                <span class="layer-name">레이어 ${index}</span>
            </div>
            <div class="layer-controls">
                <button class="visibility-btn" title="숨기기">👁</button>
                <button class="lock-btn" title="잠금">🔓</button>
                <button class="delete-btn" title="삭제">🗑</button>
            </div>
        `;

        // 레이어 클릭 시 해당 캔버스 객체 선택
        layerItem.querySelector('.layer-info').addEventListener('click', function(e) {
            // 버튼 클릭 시에는 이벤트 처리하지 않음
            if (!e.target.closest('.layer-controls')) { //현재 요소에서 시작하여 부모 방향으로 올라가면서 선택자와 일치하는 가장 가까운 조상 요소를 찾음,클릭된 요소가 .layer-controls 클래스를 가진 요소의 자식이 아닐 때" = 숨기기/잠금/삭제 버튼을 클릭했을 때는 객체 선택이 되지 않도록 하는 조건  
                fabricCanvas.discardActiveObject(); // 현재 선택된 객체 선택 해제
                fabricCanvas.setActiveObject(obj); // 클릭된 레이어의 객체 선택
                fabricCanvas.renderAll(); // 캔버스 다시 랜더링
            }
        });

        // 숨기기 버튼 이벤트
        layerItem.querySelector('.visibility-btn').addEventListener('click', function() {
            const isVisible = obj.visible;  // 현재 가시성 상태 확인
            obj.set('visible', !isVisible); // 가시성 토글
            this.textContent = isVisible ? '👁‍🗨' : '👁'; // 버튼 아이콘 변경
            fabricCanvas.renderAll();
        });

        // 잠금 버튼 이벤트
        layerItem.querySelector('.lock-btn').addEventListener('click', function() {
            const isLocked = obj.lockMovementX; // 현재 잠금 상태 확인
            // 객체의 모든 조작 가능 속성 설정
            obj.set({
                lockMovementX: !isLocked,
                lockMovementY: !isLocked,
                lockRotation: !isLocked,
                lockScalingX: !isLocked,
                lockScalingY: !isLocked,
                selectable: isLocked,
                hoverCursor: !isLocked ? 'default' : 'move',
                moveCursor: !isLocked ? 'default' : 'move'
            });
            // obj.set({
            //     selectable: isLocked,
            //     hoverCursor: !isLocked ? 'default' : 'move',
            //     moveCursor: !isLocked ? 'default' : 'move'
            // });
            this.textContent = isLocked ? '🔓' : '🔒';
            fabricCanvas.renderAll();
        });

        // 삭제 버튼 이벤트
        layerItem.querySelector('.delete-btn').addEventListener('click', function() {
            if (confirm('이 레이어를 삭제하시겠습니까?')) {
                fabricCanvas.remove(obj);  // 캔버스에서 객체 제거
                layerItem.remove(); // DOM에서 레이어 아이템 제거
                updateLayerIndices(); // 레이어 인덱스 재정렬
            }
        });

        // 생성된 레이어 아이템을 레이어 패널에 추가
        layerContent.appendChild(layerItem); //한 노드를 다른 노드의 자식으로 추가하는 메서드,새로 생성한 레이어 아이템(layerItem)을 레이어 패널의 컨텐츠 영역(layerContent)에 추가
    };

    // 레이어 인덱스 업데이트
    function updateLayerIndices() {
        // 모든 레이어 아이템을 선택
        const layerItems = layerContent.querySelectorAll('.layer-item');
        // 각 레이어의 이름을 순서대로 업데이트
        layerItems.forEach((item, index) => {
            item.querySelector('.layer-name').textContent = `레이어 ${index + 1}`;
        });
    }
});