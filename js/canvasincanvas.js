document.addEventListener('DOMContentLoaded', function() {
// 캔버스 및 Fabric.js 설정
const canvas = new fabric.Canvas('braceletCanvas', {
    backgroundColor: '#ffffff',
    selection: false
  });
  
  // 팔찌 이미지 추가
  fabric.Image.fromURL('images/band.png', (img) => {
    img.set({
      left: 100,
      top: 100,
      selectable: false,
      hoverCursor: 'default'
    });
    img.scaleToWidth(600); // 이미지 크기를 캔버스에 맞게 조정
  
    canvas.add(img);
    
    // 인쇄 가능 영역 설정
    const printArea = new fabric.Rect({
      left: img.left + 50,
      top: img.top + 30,
      width: 500,
      height: 40,
      fill: 'transparent',
      stroke: 'red',
      strokeDashArray: [5, 5],
      selectable: false
    });
    canvas.add(printArea);
  
    // 원 객체 추가
    const circle = new fabric.Circle({
      left: printArea.left + 10,
      top: printArea.top + 10,
      radius: 15,
      fill: 'blue',
      selectable: true,
      hasBorders: true,
      hasControls: false // 크기 조정을 못하게 설정
    });
    canvas.add(circle);
  
    // 원 객체가 인쇄 가능 영역 내에서만 움직이도록 설정
    circle.on('moving', () => {
      circle.setCoords();
      
      // 좌측 경계 제한
      if (circle.left < printArea.left) {
        circle.left = printArea.left;
      }
      // 우측 경계 제한
      if (circle.left + circle.width > printArea.left + printArea.width) {
        circle.left = printArea.left + printArea.width - circle.width;
      }
      // 상단 경계 제한
      if (circle.top < printArea.top) {
        circle.top = printArea.top;
      }
      // 하단 경계 제한
      if (circle.top + circle.height > printArea.top + printArea.height) {
        circle.top = printArea.top + printArea.height - circle.height;
      }
    });
  
    // 팔찌 색상 변경 함수
    function changeBraceletColor(color) {
      img.filters = [new fabric.Image.filters.Tint({ color: color, opacity: 0.6 })];
      img.applyFilters();
      canvas.renderAll();
    }
  
    // 색상 변경 함수를 전역으로 노출 (HTML 버튼과 연결됨)
    window.changeBraceletColor = changeBraceletColor;
});
});