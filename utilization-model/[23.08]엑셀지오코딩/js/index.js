// 주소에서 좌표를 정상적으로 가져온 주소 리스트를 저장할 배열
var geosuccess = [];
// 주소에서 좌표를 가져오는데 실패한 주소 리스트를 저장할 배열
var geofall = [];
// 현재 선택된 파일 이름을 저장할 변수
var fileName = "";

/**
 * 엑셀 업로드시 파일을 읽어서 주소를 좌표로 변환하는 함수
 */
function readExcel() {
    // 주소에서 좌표를 정상적으로 가져온 주소 리스트를 초기화
    geosuccess = [];
    // 주소에서 좌표를 가져오는데 실패한 주소 리스트를 초기화
    geofall = [];
    // 팝업창 초기화
    $("#popup-content").empty();
    // 파일 업로드 인풋 요소를 가져옴
    let input = event.target;
    // 파일을 읽어오는 객체 생성
    let reader = new FileReader();
    // 파일 이름 추출
    fileName = input.value.split("\\").pop().replace(".xls", "");
    // 이미 등록된 파일인 경우
    if (document.getElementById(fileName) != null) {
        alert("이미 등록된 파일입니다.");
    } else {
        // FileReader 객체의 onload 이벤트 핸들러 정의
        reader.onload = function () {
            // 읽은 데이터 가져오기
            let data = reader.result;
            // 엑셀 파일 읽기
            let workBook = XLSX.read(data, {type: "binary"});
            // 첫 번째 시트의 데이터를 JSON 형식으로 변환
            let rows = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]]);
            // 각각의 행에 대하여
            rows.forEach(function (a) {
                // 주소 검색 API 호출
                $.ajax({
                    type: "get",
                    url: "https://api.vworld.kr/req/address",
                    data: {
                        service: "address",
                        request: "getcoord",
                        version: "2.0",
                        crs: "epsg:4326",
                        address: a["주소"],
                        refine: "true",
                        simple: "false",
                        format: "json",
                        type: "PARCEL",
                        key: apikey
                    },
                    dataType: "jsonp",
                    async: false,
                    success: function (data) {
                        // API 호출이 성공하면
                        if (data?.response?.result?.point?.x) {
                            // geosuccess 배열에 변환된 좌표 추가
                            geosuccess.push([a["주소"], [data.response.result.point.x, data.response.result.point.y],[data.response.refined.structure.level4LC]])
                            // #popup-content 요소 안에 성공 메시지 추가
                            $("#popup-content").append("<span style='color: #32CD32'>(성공)</span> " + a["주소"] + "<br/>")
                            // API 호출이 실패하면
                        } else {
                            $.ajax({
                                type: "get",
                                url: "https://api.vworld.kr/req/address",
                                data: {
                                    service: "address",
                                    request: "getcoord",
                                    version: "2.0",
                                    crs: "epsg:4326",
                                    address: a["주소"],
                                    refine: "true",
                                    simple: "false",
                                    format: "json",
                                    type: "ROAD",
                                    key: apikey
                                },
                                dataType: "jsonp",
                                async: false,
                                success: function (dataT) {
                                    if (dataT?.response?.result?.point?.x) {
                                        // geosuccess 배열에 변환된 좌표 추가
                                        geosuccess.push([a["주소"], [dataT.response.result.point.x, dataT.response.result.point.y],[dataT.response.refined.structure.level4LC]])
                                        // #popup-content 요소 안에 성공 메시지 추가
                                        $("#popup-content").append("<span style='color: #32CD32'>(성공)</span> " + a["주소"] + "<br/>")
                                        // API 호출이 실패하면
                                    }else{
                                        // geofall 배열에 주소 추가
                                        geofall.push(a["주소"])
                                        // #popup-content 요소 안에 실패 메시지 추가
                                        $("#popup-content").append("<span style='color: #DC143C'>(실패)</span> " + a["주소"] + "<br/>")
                                    }
                                    document.getElementById("popup-content").scrollTop = document.getElementById("popup-content").scrollHeight
                                    // #popup 요소의 높이 조절
                                    document.getElementById("popup").style.height = (document.getElementById("popup-content").offsetHeight + 170) + "px"
                                }
                            })
                        }
                        document.getElementById("popup-content").scrollTop = document.getElementById("popup-content").scrollHeight
                        // #popup 요소의 높이 조절
                        document.getElementById("popup").style.height = (document.getElementById("popup-content").offsetHeight + 170) + "px"
                    },
                });
            })
        };
        // FileReader 객체가 파일을 읽음
        reader.readAsBinaryString(input.files[0]);
        // popuptoogle 함수 호출
        popuptoogle("filecheck");
    }
    // "csvGeo"라는 id를 가진 요소의 값을 빈 문자열로 설정
    document.getElementById("csvGeo").value = "";
}


/**
 * 지오코딩 결과를 지도에 표출
 */
$(function () {
    // 체크박스가 클릭될 때마다 이벤트 리스너가 작동
    $(document).on("click", "[type=checkbox]", function () {
        // 클릭된 체크박스를 변수에 저장
        var checkbox = $(this);
        // Map 객체의 레이어 배열에서 체크박스의 값과 일치하는 이름을 가진 레이어를 찾음
        var layer = Map.getLayers().getArray().find(function (layer) {
            if (layer.get("name") === checkbox.val()) {
                return layer;
            }
        });
        // 체크박스가 체크되어 있으면 해당 레이어를 보이게 함
        if (checkbox.is(":checked")) {
            layer.setVisible(true);
        } else { // 체크박스가 체크되어 있지 않으면 해당 레이어를 숨김
            layer.setVisible(false);
        }
    });
})

/**
 * 입력된 ID의 자식 요소에 있는 li목록을 모두 찾아서 엑셀로 다운로드
 * @param name li를 찾을 부모 요소의 ID
 */
function xlsdownload(name){
    // name 인자로 받은 id를 가진 요소 안에 있는 .geolists li 요소들을 찾음
    const geolists = document.querySelectorAll("#"+ name +" .geolists li");
    // CSV 문자열 초기화
    let csvContent = "\uFEFF";

    // 각각의 li 요소에 대하여
    geolists.forEach(function(li) {
        // onclick 속성값에서 위도와 경도 값을 추출
        const coords = li.getAttribute("onclick").match(/moveTo\((.*),(.*)\)/);
        const lat = coords[1];
        const lng = coords[2];
        // li 요소의 텍스트 내용에서 주소를 추출
        const address = li.textContent.trim().replace(/,/g, "");
        // CSV 문자열에 주소, 위도, 경도 값을 추가
        csvContent += `${address},${lat},${lng}\n`;
    });

    // CSV 문자열을 Blob 객체로 변환
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    // 다운로드 링크 생성
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "geolists.csv");
    document.body.appendChild(link);
    // 링크 클릭하여 CSV 파일 다운로드
    link.click();
    // 링크 제거
    document.body.removeChild(link);
}


/**
 * 팝업창을 띄우거나 닫는 함수
 * @param name 어떤 팝업이 작동할지 결정하는 인자
 */
function popuptoogle(name){
    // name 인자의 값에 따라 다른 동작 수행
    switch (name) {
        case "filecheck":
            // #filecheck 요소가 숨겨져 있으면
            if ($("#filecheck").is(":hidden")) {
                // #filecheck 요소를 보이게 하고 #seeBox 요소를 숨김
                $("#filecheck").show();
                $("#seeBox").hide();
            } else { // #filecheck 요소가 보이고 있으면
                // #filecheck 요소를 숨김
                $("#filecheck").hide();
            }
            break;
        case "seeBox":
            // #seeBox 요소가 숨겨져 있으면
            if ($("#seeBox").is(":hidden")) {
                // #seeBox 요소를 보이게 하고 #filecheck 요소를 숨김
                $("#seeBox").show();
                $("#filecheck").hide();
            } else { // #seeBox 요소가 보이고 있으면
                // #seeBox 요소를 숨김
                $("#seeBox").hide();
            }
            break;
    }
}

/**
 * 지도를 초기화하고 지도를 표시할 div 요소의 id를 지정하고 반응형으로 조절
 */
    // "map"과 "seeBox"라는 id를 가진 요소를 찾아서 변수에 저장
let mapContainer = document.getElementById("map");
let seeBox = document.getElementById("seeBox");

// "map" 요소의 높이를 조절
mapContainer.style.height = (window.innerHeight - mapContainer.offsetTop) - 7 + "px";
// "seeBox" 요소의 높이와 너비를 조절
seeBox.style.height = (window.innerHeight * 0.7) + "px";
seeBox.style.width = (window.innerWidth * 0.8) + "px";

// 윈도우 창의 크기가 변경될 때마다 이벤트 리스너가 작동
window.addEventListener("resize", function () {
    // "map" 요소의 높이를 다시 조절
    mapContainer.style.height = (window.innerHeight - mapContainer.offsetTop) - 7 + "px";
    // "seeBox" 요소의 높이와 너비를 다시 조절
    seeBox.style.height = (window.innerHeight * 0.7) + "px";
    seeBox.style.width = (window.innerWidth * 0.8) + "px";
});


/**
 * 지오코딩 결과를 팝업에 표시하고 확인시 지오코딩 목록과 Openlayers의 레이어에 추가
 */

function designChange(img){
    //class 추가하기
    switch (img.classList.toString()){
        case "designimg":
            if (document.querySelector(".chkimg" != null) || document.querySelector(".chkimg")){
                document.querySelector(".chkimg").classList.add("designimg");
                document.querySelector(".chkimg").classList.remove("chkimg");
            }
            img.classList.remove("designimg");
            img.classList.add("chkimg");
            document.getElementById("inputimage").value = img.attributes.src.value;
            break;
        case "chkimg":
            img.classList.remove("chkimg");
            img.classList.add("designimg");
            document.getElementById("inputimage").value = "";
            break;
    }
}

    // "filecheck", "cancel-button", "ok-button"이라는 id를 가진 요소를 찾아서 각각의 변수에 저장
const popupContainer = document.getElementById("filecheck");
const cancelButton = document.getElementById("cancel-button");
const okButton = document.getElementById("ok-button");
const designButton = document.getElementById("design-button");
const canceldesign = document.getElementById("cancel-design");
const okdesign = document.getElementById("ok-design")

okdesign.addEventListener("click", () => {
    if (document.getElementById("inputimage").value === "") {
        alert("이미지를 선택해주세요.");
    }else{
        document.getElementById("popup-design").style.display = "none";
        document.getElementById("popup-buttons").style.display = "block";
    }
});
canceldesign.addEventListener("click", () => {
    document.getElementById("popup-design").style.display = "none";
    document.getElementById("popup-buttons").style.display = "block";
    document.getElementById("inputimage").value = "";
});
designButton.addEventListener("click", () => {
    document.getElementById("popup-design").style.display = "block";
    document.getElementById("popup-buttons").style.display = "none";
});
// cancelButton 요소에 클릭 이벤트 리스너 추가
cancelButton.addEventListener("click", () => {
    // popupContainer 요소를 숨김
    popupContainer.style.display = "none";
});

// okButton 요소에 클릭 이벤트 리스너 추가
okButton.addEventListener("click", () => {
    // 랜덤한 색상 생성
    var color = "rgba(" +
        Math.floor(Math.random() * 256) + "," +
        Math.floor(Math.random() * 256) + "," +
        Math.floor(Math.random() * 256) + "," +
        "0.8)";
    // 원형 스타일 정의
    var redCircleStyle;
    if (document.getElementById("inputimage").value === "") {
        redCircleStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: color
                }),
                stroke: new ol.style.Stroke({
                    color: color,
                    width: 2
                })
            })
        });
    }else{
        redCircleStyle = new ol.style.Style({
            image: new ol.style.Icon({
                src: document.getElementById("inputimage").value,
                scale: 0.038,
                anchor: [0.5, 0.5],
                rotateWithView: false
            }),
            stroke: new ol.style.Stroke({
                color: color,
                width: 2
            }),
            fill: new ol.style.Fill({
                color: color
            })
        });
    }
    popupContainer.style.display = "none";
    document.getElementById("inputimage").value = "";
    // #seeBox 요소 안에 새로운 HTML 요소 추가
    $("#seeBox").append('<div class="seeBoxList"><div class="SeeBoxTitle"><span class="onoffSpan">' + fileName + ' </span><span onclick="xlsdownload(\'' + fileName + '\')">(다운로드)</span><label class="onofSwitch"><input type="checkbox" value="' + fileName + '" checked> <span class="chkSwitch"></span></label></div><div id="' + fileName + '"></div></div>')
    // Map 객체에 새로운 벡터 레이어 추가
    Map.addLayer(new ol.layer.Vector({
        name: fileName,
        source: new ol.source.Vector({
            features: []
        }),
        style: redCircleStyle
    }));
    // Map 객체의 레이어 배열에서 fileName과 일치하는 이름을 가진 레이어를 찾음
    var layer = Map.getLayers().getArray().find(function (layer) {
        return layer.get("name") === fileName;
    });

    // HTML 문자열 생성
    let html = "<ul class='geolists'>"
    geosuccess.forEach(function (addr) {
        // li 요소 추가
        html += "<li onclick='moveTo(" + addr[1][0] + "," + addr[1][1] + ")'> " + addr[0] + "</li>"
        // 해당 위치에 점 추가
        layer.getSource().addFeatures([
            new ol.Feature({
                geometry: new ol.geom.Point(EPSGChg(addr[1][0], addr[1][1])),
            })
        ]);
    })
    html += "</ul>"
    // HTML 문자열을 #fileName 요소 안에 추가
    $("#" + fileName).append(html)
});


/**
 * Openlayers의 지도 표출 및 기능 구현
 */
// 지도 생성
let Map = new ol.Map({
    target: "map",
    layers: [Satellite],
    view: new ol.View({
        center: EPSGChg(127.100616, 37.402142),
        zoom: 10,
        minZoom: 5,
        maxZoom: 18,
    })
})

// 좌표계 변환 함수 정의
function EPSGChg(x, y) {
    return ol.proj.transform([x, y], "EPSG:4326", "EPSG:3857");
}

// 지도의 중심 좌표와 줌 레벨 변경 함수 정의
function moveTo(x, y) {
    Map.getView().setCenter(EPSGChg(x, y));
    Map.getView().setZoom(18);
    $("#seeBox").hide();
}

// 지도의 레이어 보이기/숨기기 상태 변경 함수 정의
function toggleLayer(name, visible) {
    map.getLayers().forEach(function (layer) {
        if (layer.get("name") === name) {
            layer.setVisible(visible);
        }
    });
}

// 지도에 클릭 이벤트 리스너 추가
Map.on("click", function (){
    // #seeBox 요소를 숨김
    $("#seeBox").hide();
})

// 지도에 이동 시작 이벤트 리스너 추가
Map.on("movestart", function (){
    // #seeBox 요소를 숨김
    $("#seeBox").hide();
})


/**
 * 디버그용
 */
function cmd(){
    console.debug("imgshow() : 이미지 입력창 보이기")
    console.debug("imgput() : 이미지 입력창에 기본값 입력")
}
function imgshow(){
    document.getElementById("inputimage").hidden = false;
}
function imgput(){
    // 이미지 출처 https://pixabay.com/ko/vectors/%ec%84%b8%ea%b3%84-%ec%a7%80%ea%b5%ac-%ed%96%89%ec%84%b1-%eb%8c%80%eb%a5%99-%ea%b5%ac%ec%b2%b4-153534/
    document.getElementById("inputimage").value = "https://cdn.pixabay.com/photo/2013/07/12/18/35/world-153534_960_720.png";
}