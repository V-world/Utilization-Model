load3dchk = false;
var mPosi, point5Coord;
function openTab(tabName) {
	var i, tabcontent, tab;

	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}

	tab = document.getElementsByClassName("tab");
	for (i = 0; i < tab.length; i++) {
		tab[i].className = tab[i].className.replace(" active", "");
	}

	var currentTab = document.getElementById(tabName);
	currentTab.style.display = "block";

	for (i = 0; i < tab.length; i++) {
		if (tab[i].getAttribute('onclick') === "openTab('" + tabName + "')") {
			tab[i].className += " active";
		}
	}
}

let Map = new ol.Map({
	target: "map",
	layers: [Base],
	view: new ol.View({
		center: [14134087.274867365, 4515847.932497318],
		zoom: 19,
		minZoom: 5,
		maxZoom: 19,
	})
})
var mapOptions = new vw.MapOptions(
	vw.BasemapType.GRAPHIC,
	"",
	vw.DensityType.FULL,
	vw.DensityType.BASIC,
	false,
	new vw.CameraPosition(
		new vw.CoordZ(-97, 38, 30000),
		new vw.Direction(0, -45, 0)
	),
	new vw.CameraPosition(
		new vw.CoordZ(126.824883, 37.524370, 30000),
		new vw.Direction(0, -45, 0)
	)
);
maps = new vw.Map("map3d", mapOptions);
vw.ws3dInitCallBack = function () {
	$("#naviRotate").css("display", "none");
	$("#coordinatesContainer2").css("display", "none");
	$("#naviZoomPannel").css("display", "none");
	maps.getElementById('poi_base').hide()
	$("#mapToolBar").append("<span style='font-size: 18px; color: white; font-weight: bold'>3D지도로 마우스 오른쪽 클릭을 통해 주변을 둘러볼 수 있습니다.</span>")
	if(load3dchk){
		maps.moveTo(mPosi);
		maps.moveTo(mPosi);
		var pt = new vw.geom.Point(point5Coord);
		pt.setImage("https://map.vworld.kr/images/v4map/umap/pointer/ico-type1-05.png");
		pt.setId("map3dMarker");
		pt.create();
		load3dchk = false;
	}
};

//y 값 openlayers xy 값
Map.on('click', function (evt) {
	let coordinate = evt.coordinate;
	$.ajax({
		url: "https://api.vworld.kr/req/data?",
		type: "get",
		dataType: "jsonp",
		data: {
			service: "data",
			version: "2.0",
			request: "GetFeature",
			key: apikey,
			format: "json",
			size: "1",
			geomfilter: "point(" + coordinate[0] + " " + coordinate[1] + ")",
			crs: "EPSG:3857",
			data: "LP_PA_CBND_BUBUN",
		},
		beforeSend: function (){
			$("#loading").css("display", "block")
		},
		error: function (){
			$("#loading").css("display", "none")
			alert("데이터를 불러오는데 실패하였습니다.")
		},
		success: function (data){
			$("#addrName").text("ㆍ" + data.response.result.featureCollection.features[0].properties.addr);

			$.ajax({
				url: "https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?",
				type: "get",
				dataType: "json",
				data: {
					serviceKey: "yJkg311Qg9Eq0X9Si08FqSPeDQJCqP4uS9nW+4ADeoHWXkF1j8TrQ+rBNRikicwGB7wGc4AUQtWishlRlSuhMw==",
					sigunguCd: data.response.result.featureCollection.features[0].properties.pnu.slice(0, 5),
					bjdongCd: data.response.result.featureCollection.features[0].properties.pnu.slice(5, 10),
					platGbCd: data.response.result.featureCollection.features[0].properties.pnu.slice(10, 11),
					bun: data.response.result.featureCollection.features[0].properties.pnu.slice(11, 15),
					ji: data.response.result.featureCollection.features[0].properties.pnu.slice(15, 19),
					numOfRows: "1",
					pageNo: "1",
					_type : "json"
				},
				success: function (dataT){
					/** 
					$.ajax({
						url: "https://apis.data.go.kr/1611000/nsdi/BuildingAgeService/attr/getBuildingAge?",
						type: "get",
						data: {
							serviceKey: "yJkg311Qg9Eq0X9Si08FqSPeDQJCqP4uS9nW+4ADeoHWXkF1j8TrQ+rBNRikicwGB7wGc4AUQtWishlRlSuhMw==",
							pageNo: "1",
							numOfRows: "1",
							pnu: data.response.result.featureCollection.features[0].properties.pnu,
							format: "json"
						},
						success: function (dataH) {
						*/

							$("#buildingName").text(dataT.response.body.items.item?.bldNm);
							$("#buildingCode").text(dataT.response.body.items.item?.mainPurpsCdNm);
							$("#buildingHeight").text(dataT.response.body.items.item?.heit+"m");//㎡
							$("#buildingGround").text(dataT.response.body.items.item?.platGbCd == 0 ? "대지" : dataT.response.body.items.item?.platGbCd == 1 ? "산" : "블록");
							$("#buildingFloor").text(dataT.response.body.items.item?.ugrndFlrCnt + " / " + dataT.response.body.items.item?.grndFlrCnt);
							//$("#mainPrposCodeNm").text(dataH.buildingAges.field[0]?.mainPrposCodeNm);
							$("#buildingPlatArea").text(dataT.response.body.items.item?.platArea+"㎡");
							$("#buildingArchArea").text(dataT.response.body.items.item?.archArea+"㎡");
							$("#buildingStrctCdNm").text(dataT.response.body.items.item?.strctCdNm);
							$("#buildingEngrGrade").text(dataT.response.body.items.item?.engrGrade == "" || " " ? "정보없음" : dataT.response.body.items.item?.engrGrade);
							$("#buildingRserthqkDsgnApplyYn").text(dataT.response.body.items.item?.rserthqkDsgnApplyYn);
							$("#buildingRserthqkAblty").text(dataT.response.body.items.item?.rserthqkAblty == "" || " "  ? "정보없음" : dataT.response.body.items.item?.rserthqkAblty);
							//$("#buildingAge").text(dataH.buildingAges.field[0]?.buldAge);
							//$("#buildingUseConfmDe").text(dataH.buildingAges.field[0]?.useConfmDe);


							$("#popup").css("display", "block");
							openTab('Tab1');

							var route = "";
							data.response.result.featureCollection.features[0].geometry.coordinates[0][0].forEach(function (xylist) {
								route += xylist[0] + " " + xylist[1] + ",";
							})
							$("#buildingImg").attr("src", "https://api.vworld.kr/req/image?service=image&request=getmap&key=CBDA8338-FEF2-34AE-9B04-D31B3597153F&basemap="+"GRAPHIC"+"&size=629,300&crs=epsg:3857&zoom=18&center=" + coordinate + "&route=point:" + route + "|color:red|width:3|style:solid");

							var Obj = maps.getObjectById("map3dMarker");
							maps.removeObject(Obj);
							var coord = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
							point5Coord = new vw.Coord(coord[0], coord[1]);
							var pt = new vw.geom.Point(point5Coord);
							pt.setImage("https://map.vworld.kr/images/v4map/umap/pointer/ico-type1-05.png");
							pt.setId("map3dMarker");
							pt.create();

							coord[1] = coord[1] + 0.0003;
							var movePo = new vw.CoordZ(coord[0], coord[1], 50);
							mPosi = new vw.CameraPosition(movePo, new vw.Direction(0, -45, 0));
							load3dchk = true;
							maps.moveTo(mPosi);
							$("#Tab3 table tbody").empty();
							getIndvdLandPriceAttr(data.response.result.featureCollection.features[0].properties.pnu);
						},
						error: function (e) {
							alert("건물정보를 불러오는데 실패하였습니다.");
						},
						complete: function () {
							$("#loading").css("display", "none");
						},
					})
					/*
				}
			})
				*/
		}
	})
})
function getIndvdLandPriceAttr(pnu) {
	$.ajax({
		url: "https://apis.data.go.kr/1611000/nsdi/IndvdLandPriceService/attr/getIndvdLandPriceAttr?",
		type: "get",
		data: {
			serviceKey: "CBDA8338-FEF2-34AE-9B04-D31B3597153F",
			pnu: pnu,
			stdrYear: "2023",
			format: "json",
			numOfRows: "1",
			pageNo: "1"
		},
		success: function (dataS){
			$("#Tab3 table tbody").append("<tr><td>2023</td><td>"+dataS.indvdLandPrices.field[0].pblntfDe+"</td><td>"+numberWithCommas(dataS.indvdLandPrices.field[0].pblntfPclnd)+"</td><td>"+dataS.indvdLandPrices.field[0].stdLandAt+"</td></tr>");
		},
		complete: function (){
			$.ajax({
				url: "http://api.vworld.kr/ned/data/getIndvdLandPriceAttr?",
				type: "get",
				data: {
					serviceKey: "CBDA8338-FEF2-34AE-9B04-D31B3597153F",
					pnu: pnu,
					stdrYear: "2021",
					format: "json",
					numOfRows: "1",
					pageNo: "1"
				},
				success: function (dataS){
					$("#Tab3 table tbody").append("<tr><td>2021</td><td>"+dataS.indvdLandPrices.field[0].pblntfDe+"</td><td>"+numberWithCommas(dataS.indvdLandPrices.field[0].pblntfPclnd)+"</td><td>"+dataS.indvdLandPrices.field[0].stdLandAt+"</td></tr>");
				},
				complete: function (){
					$.ajax({
						url: "http://api.vworld.kr/ned/data/getIndvdLandPriceAttr?",
						type: "get",
						data: {
							serviceKey: "CBDA8338-FEF2-34AE-9B04-D31B3597153F",
							pnu: pnu,
							stdrYear: "2020",
							format: "json",
							numOfRows: "1",
							pageNo: "1"
						},
						success: function (dataS){
							$("#Tab3 table tbody").append("<tr><td>2020</td><td>"+dataS.indvdLandPrices.field[0].pblntfDe+"</td><td>"+numberWithCommas(dataS.indvdLandPrices.field[0].pblntfPclnd)+"</td><td>"+dataS.indvdLandPrices.field[0].stdLandAt+"</td></tr>");
						},
						complete: function (){
							$.ajax({
								url: "http://api.vworld.kr/ned/data/getIndvdLandPriceAttr?",
								type: "get",
								data: {
									serviceKey: "CBDA8338-FEF2-34AE-9B04-D31B3597153F",
									pnu: pnu,
									stdrYear: "2019",
									format: "json",
									numOfRows: "1",
									pageNo: "1"
								},
								success: function (dataS){
									$("#Tab3 table tbody").append("<tr><td>2019</td><td>"+dataS.indvdLandPrices.field[0].pblntfDe+"</td><td>"+numberWithCommas(dataS.indvdLandPrices.field[0].pblntfPclnd)+"</td><td>"+dataS.indvdLandPrices.field[0].stdLandAt+"</td></tr>");
								},
								complete: function (){
									$.ajax({
										url: "http://api.vworld.kr/ned/data/getIndvdLandPriceAttr?",
										type: "get",
										data: {
											serviceKey: "CBDA8338-FEF2-34AE-9B04-D31B3597153F",
											pnu: pnu,
											stdrYear: "2018",
											format: "json",
											numOfRows: "1",
											pageNo: "1"
										},
										success: function (dataS){
											$("#Tab3 table tbody").append("<tr><td>2018</td><td>"+dataS.indvdLandPrices.field[0].pblntfDe+"</td><td>"+numberWithCommas(dataS.indvdLandPrices.field[0].pblntfPclnd)+"</td><td>"+dataS.indvdLandPrices.field[0].stdLandAt+"</td></tr>");
										},
										complete: function (){
										}
									})
								}
							})
						}
					})
				}
			})
		}
	})
}
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}