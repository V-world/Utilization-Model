
// 마우스 클릭 이벤트 등록
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
let firstClick;
let secondClick;

handler.setInputAction(function(event) {
  // 첫 번째 클릭 시점
  if (!firstClick) {
    firstClick = event.position;
  }
  // 두 번째 클릭 시점
  else {
    secondClick = event.position;
    // 거리 계산
    const firstPosition = viewer.camera.pickEllipsoid(firstClick);
    const secondPosition = viewer.camera.pickEllipsoid(secondClick);
    const distance = Cesium.Cartesian3.distance(firstPosition, secondPosition);
    // 표시
    const label = viewer.entities.add({
      label : {
        text : distance.toFixed(2) + " m",
        position : secondPosition,
        font : "16px sans-serif",
        fillColor : Cesium.Color.WHITE,
        outlineColor : Cesium.Color.BLACK,
        outlineWidth : 2,
        pixelOffset : new Cesium.Cartesian2(0, -20),
        verticalOrigin : Cesium.VerticalOrigin.BOTTOM
      }
    });
    // 다시 클릭할 수 있도록 초기화
    firstClick = undefined;
    secondClick = undefined;
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);