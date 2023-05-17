
const ToruConfig = {
    serviceKey: "aCdaU+NvJ5bk1HWXu5BRZWjG6uMcj9Wz9UUBoruCaG9ZjBIcQ0Sd7cS0zQmiqK7UV6rfB0LgRSlRO2LcXWpCfA==",
    MobileApp: "VWORLD",
    MobileOS: "ETC"
}

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

function EPSGChg(x, y) {
    return ol.proj.transform([x, y], "EPSG:4326", "EPSG:3857");
}

Map.on("movestart", function () {
    $('#info').addClass('hide');
})

var informationMarker = new ol.layer.Vector({
    source: new ol.source.Vector(),
    name: "informationMarker",
    style: function (feature) {
        return new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 10],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: feature.get("emoji"),
                scale: 1,
            })),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
        });
    }
});

var clusterSource = new ol.source.Cluster({
    distance: 50,
    source: informationMarker.getSource(),
});

var clusterLayer = new ol.layer.Vector({
    source: clusterSource,
    style: function (feature) {
        if (feature.get('features').length > 1) {
            return new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 10],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: feature.get('features')[0].get("emoji"),
                    scale: 1,
                })),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
                text: new ol.style.Text({
                    text: feature.get('features').length.toString() + "개",
                    textOverflow: 'ellipsis',
                    overflow: true,
                    font: 'bold 30px sans-serif',
                    fill: new ol.style.Fill({
                        color: "#000"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "#fff",
                        width: 3
                    }),
                    offsetY: 80,
                    textAlign: 'center',
                }),
            });
        } else {
            return new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 10],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: feature.get('features')[0].get("emoji"),
                    scale: 1,
                })),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
            });
        }
    },
});

Map.addLayer(clusterLayer);

var selectInteraction = new ol.interaction.Select();

selectInteraction.on('select', function (event) {
    var selectedFeatures = event.target.getFeatures().getArray();

    if (selectedFeatures.length > 0) {
        var firstFeature = selectedFeatures[0];
        if (firstFeature.get("features").length > 1) {
            var extent = ol.extent.createEmpty();
            firstFeature.get("features").forEach(function (feature) {
                ol.extent.extend(extent, feature.getGeometry().getExtent());
            });
            Map.getView().fit(extent, Map.getSize());
        } else {
            firstFeature.setStyle(new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 10],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: firstFeature.get("features")[0].get("emoji"),
                    scale: 1,
                })),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
            }));
            $("#info_title").text(firstFeature.get("features")[0].get("name"))
            $("#info_addr").text(firstFeature.get("features")[0].get("addr"))
            $("#info_img").html("<img src='" + firstFeature.get("features")[0].get("img1") + "' alt='이미지' style='width: 100%; height: 40vh;'>")
            if (firstFeature.get("features")[0].get("tel") === "" || firstFeature.get("features")[0].get("tel") == null || firstFeature.get("features")[0].get("tel") === " "){
                $("#info_tel").text("전화번호: 없음")
            } else {
                $("#info_tel").text("전화번호: " + firstFeature.get("features")[0].get("tel"))
            }
            if (firstFeature.get("features")[0].get("alink") === "" || firstFeature.get("features")[0].get("alink") == null || firstFeature.get("features")[0].get("alink") === " "){
                $("#info_alink").text("홈페이지: 없음")
            } else {
                $("#info_alink").text("홈페이지: " + firstFeature.get("features")[0].get("alink"))
            }
            if ( firstFeature.get("features")[0].get("overview") === "" || firstFeature.get("features")[0].get("overview") == null || firstFeature.get("features")[0].get("overview") === " "){
                $("#info_overview").text("설명: 없음")
            } else {
                $("#info_overview").text(firstFeature.get("features")[0].get("overview"))
            }
            $("#info_contentId").val(firstFeature.get("features")[0].get("contentId"))
            infoSel(1);
            $('#info').removeClass('hide');
        }
    }
});

// Add the select interaction to the map
Map.addInteraction(selectInteraction);

var emojiid;
window.onload = function () {
    var isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent);
    /*
    🗽0x1F5FD
    🏛0x1F3DB
    🎆0x1F386
    🛫0x1F6EB
    🚴0x1F6B4
    ⛺0x26FA
    🏪0x1F3EA
    🍝0x1F35D
    */
    emojiid = {
        12: String.fromCodePoint(0x1F5FD),
        14: String.fromCodePoint(0x1F3DB),
        15: String.fromCodePoint(0x1F386),
        25: String.fromCodePoint(0x1F6EB),
        28: String.fromCodePoint(0x1F6B4),
        32: String.fromCodePoint(0x26FA),
        38: String.fromCodePoint(0x1F3EA),
        39: String.fromCodePoint(0x1F35D),
    }
    dataload();
    if (!isMobile) {
        $("#alrt").css("display", "block");
    }
}


/**
 * 유니코드를 이모지로 변환
 * @uniemoji 이모지
 * @returns 이모지 임의의 URL 주소
 */
function emojiConvert(uniemoji) {
    emoji = emojiid[uniemoji];
    var canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    var ctx = canvas.getContext('2d');
    ctx.font = '96px serif';
    ctx.fillText(emoji, 0, 64);
    return canvas.toDataURL();
}


let content = 12;
let areaCode = 1;
var mapextent;

function dataload() {
    $.ajax({
        url: "https://apis.data.go.kr/B551011/KorService1/areaBasedList1?",
        data: {
            numOfRows: 100,
            pageNo: 1,
            MobileOS: ToruConfig.MobileOS,
            MobileApp: ToruConfig.MobileApp,
            ServiceKey: ToruConfig.serviceKey,
            _type: "json",
            contentTypeId: content,
            areaCode: areaCode,
        },
        error: function (xhr, status, error) {
            alert("데이터 불러오기 실패 - 1분 뒤 이용가능합니다");
        },
        beforeSend: function () {
            informationMarker.getSource().clear();
            $("#loadingdiv").show();
        },
        success: function (data) {
            let addr;
            data.response.body.items.item.forEach(function (item) {
                if (item.addr1 == null) {
                    addr = item.addr2;
                } else {
                    addr = item.addr1 + " " + item.addr2;
                }
                if (!(item.mapx == 0 || item.mapy == 0)) {

                    $.ajax({
                        url: "https://apis.data.go.kr/B551011/KorService1/detailCommon1?",
                        data: {
                            serviceKey: ToruConfig.serviceKey,
                            numOfRows: "1",
                            pageNo: "1",
                            MobileOS: ToruConfig.MobileOS,
                            MobileApp: ToruConfig.MobileApp,
                            contentId: item.contentid,
                            defaultYN: "Y",
                            overviewYN: "Y",
                            _type: "json"
                        },
                        success: function (dataT) {

                            var alink, overview = null;

                            if (dataT.response.body?.items?.item[0] != undefined){
                                alink = dataT.response.body.items.item[0].homepage;
                                overview = dataT.response.body.items.item[0].overview;
                            }

                            informationMarker.getSource().addFeatures([
                                new ol.Feature({
                                    geometry: new ol.geom.Point(EPSGChg(item.mapx, item.mapy)),
                                    name: item.title,
                                    emoji: emojiConvert(content),
                                    addr: addr,
                                    img1: item.firstimage,
                                    tel: item.tel,
                                    contentId: item.contentid,
                                    content: content,
                                    overview: overview,
                                    alink: alink
                                })
                            ]);
                        },
                        complete: function () {
                            window.clearTimeout(mapextent);
                            mapextent = setTimeout(function () {
                                $("#loadingdiv").hide();
                                var featureCollection = new ol.Collection();
                                var features = informationMarker.getSource().getFeatures();
                                features.forEach(function (feature) {
                                    featureCollection.push(feature);
                                });
                                var extent = ol.extent.createEmpty();
                                featureCollection.forEach(function (feature) {
                                    ol.extent.extend(extent, feature.getGeometry().getExtent());
                                });
                                Map.getView().fit(extent, Map.getSize());
                                Map.getView().setZoom(Map.getView().getZoom()-0.3)
                            }, 3500);
                        }
                    })
                }
            })
        }
    });
};

$(document).ready(function () {
    var menuContainer = $('#menu');
    var images = menuContainer.find('img');
    var isScrolling;
    menuContainer.on('scroll', function () {
        var middlePosition = menuContainer[0].scrollLeft + (menuContainer[0].clientWidth / 2);
        var middleImage;
        for (var i = 0; i < images.length; i++) {
            var image = images[i];
            var imagePosition = image.offsetLeft + (image.offsetWidth / 2);
            if (imagePosition >= middlePosition) {
                middleImage = image;
                break;
            }
        }
        if (middleImage) {
            var altText = middleImage.alt;
            $("#locSido").text(altText);
            areaCode = middleImage.getAttribute("data-id");
        }

        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(function () {
            dataload()
        }, 500);
    });

    $('.menu-container img').click(function () {
        var offset = this.offsetLeft - (menuContainer[0].offsetWidth / 2) + (this.offsetWidth / 2);
        menuContainer.animate({
            scrollLeft: offset
        }, 150);
    });
});

function contentSel(a) {
    $("#contentSel").text(a.text);
    content = a.getAttribute("data-id");
    dataload();
    $(".contentItems").hide();
}

$("#contentSel").click(function () {
    $(".contentItems").toggle();
});

function infoSel(i){
    if (i === 1){
        $("#info_one").css("display", "block");
        $("#info_two").css("display", "none");
    } else {

        $.ajax({
            url: "https://apis.data.go.kr/B551011/KorService1/detailIntro1?",
            data: {
                numOfRows: "1",
                pageNo: "1",
                MobileOS: ToruConfig.MobileOS,
                MobileApp: ToruConfig.MobileApp,
                serviceKey: ToruConfig.serviceKey,
                _type: "json",
                contentId: $("#info_contentId").val(),
                contentTypeId: content
            },
            beforeSend: function () {
                $("#loadingdiv").show();
            },
            success: function (data) {
                var html = "<table>"
                var data = data.response.body?.items?.item[0];
                if (data !== undefined){
                    switch (content.toString()){
                        case "12":
                            if (data.accomcount.length > 0) {
                                html += "<tr><td class='table_td_one'>수용인원</td><td>" + data.accomcount + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>수용인원</td><td>정보없음</td></tr>";
                            }
                            if (data.chkbabycarriage.length > 0) {
                                html += "<tr><td class='table_td_one'>유모차 대여</td><td>" + data.chkbabycarriage + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>유모차 대여</td><td>정보없음</td></tr>";
                            }
                            if (data.chkcreditcard.length > 0) {
                                html += "<tr><td class='table_td_one'>신용카드 가능여부</td><td>" + data.chkcreditcard + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>신용카드 가능여부</td><td>정보없음</td></tr>";
                            }
                            if (data.chkpet.length > 0) {
                                html += "<tr><td class='table_td_one'>애완동물 가능여부</td><td>" + data.chkpet + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>애완동물 가능여부</td><td>정보없음</td></tr>";
                            }
                            if (data.expagerange.length > 0) {
                                html += "<tr><td class='table_td_one'>체험가능연령</td><td>" + data.expagerange + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>체험가능연령</td><td>정보없음</td></tr>";
                            }
                            if (data.expguide.length > 0) {
                                html += "<tr><td class='table_td_one'>체험안내</td><td>" + data.expguide + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>체험안내</td><td>정보없음</td></tr>";
                            }
                            if (data.infocenter.length > 0) {
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>" + data.infocenter + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>정보없음</td></tr>";
                            }
                            if (data.opendate.length > 0) {
                                html += "<tr><td class='table_td_one'>개장기간</td><td>" + data.openperiod + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>개장기간</td><td>정보없음</td></tr>";
                            }
                            if (data.parking.length > 0) {
                                html += "<tr><td class='table_td_one'>주차시설</td><td>" + data.parking + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>주차시설</td><td>정보없음</td></tr>";
                            }
                            if (data.restdate.length > 0) {
                                html += "<tr><td class='table_td_one'>쉬는날</td><td>" + data.restdate + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>쉬는날</td><td>정보없음</td></tr>";
                            }
                            if (data.useseason.length > 0) {
                                html += "<tr><td class='table_td_one'>이용시기</td><td>" + data.useseason + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>이용시기</td><td>정보없음</td></tr>";
                            }
                            if (data.usetime.length > 0) {
                                html += "<tr><td class='table_td_one'>이용시간</td><td>" + data.usetime + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>이용시간</td><td>정보없음</td></tr>";
                            }
                            break;
                        case "14":
                            if (data.accomcountculture.length > 0){
                                html += "<tr><td class='table_td_one'>수용인원</td><td>" + data.accomcountculture + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>수용인원</td><td>정보없음</td></tr>";
                            }
                            if (data.chkbabycarriageculture.length > 0){
                                html += "<tr><td class='table_td_one'>유모차 대여</td><td>" + data.chkbabycarriageculture + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>유모차 대여</td><td>정보없음</td></tr>";
                            }
                            if (data.chkcreditcardculture.length > 0){
                                html += "<tr><td class='table_td_one'>신용카드 가능여부</td><td>" + data.chkcreditcardculture + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>신용카드 가능여부</td><td>정보없음</td></tr>";
                            }
                            if (data.chkpetculture.length > 0){
                                html += "<tr><td class='table_td_one'>애완동물 가능여부</td><td>" + data.chkpetculture + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>애완동물 가능여부</td><td>정보없음</td></tr>";
                            }
                            if (data.discountinfo.length > 0 ){
                                html += "<tr><td class='table_td_one'>할인정보</td><td>" + data.discountinfo + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>할인정보</td><td>정보없음</td></tr>";
                            }
                            if (data.infocenterculture.length > 0){
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>" + data.infocenterculture + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>정보없음</td></tr>";
                            }
                            if (data.parkingculture.length >0) {
                                html += "<tr><td class='table_td_one'>주차시설</td><td>" + data.parkingculture + "</td></tr>";
                                if (data.parkingfee.length > 0) {
                                    html += "<tr><td class='table_td_one'>주차요금</td><td>" + data.parkingfee + "</td></tr>";
                                } else {
                                    html += "<tr><td class='table_td_one'>주차요금</td><td>정보없음</td></tr>";
                                }
                            } else {
                                html += "<tr><td class='table_td_one'>주차시설</td><td>정보없음</td></tr>";
                            }
                            if (data.restdateculture.length > 0){
                                html += "<tr><td class='table_td_one'>쉬는날</td><td>" + data.restdateculture + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>쉬는날</td><td>정보없음</td></tr>";
                            }
                            if (data.usefee.length > 0){
                                html += "<tr><td class='table_td_one'>이용요금</td><td>" + data.usefee + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>이용요금</td><td>정보없음</td></tr>";
                            }
                            if (data.usetimeculture.length > 0){
                                html += "<tr><td class='table_td_one'>이용시간</td><td>" + data.usetimeculture + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>이용시간</td><td>정보없음</td></tr>";
                            }
                            if (data.scale.length > 0 ){
                                html += "<tr><td class='table_td_one'>규모</td><td>" + data.scale + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>규모</td><td>정보없음</td></tr>";
                            }
                            if (data.spendtime.length > 0){
                                html += "<tr><td class='table_td_one'>관람 소요시간</td><td>" + data.spendtime + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>관람 소요시간</td><td>정보없음</td></tr>";
                            }
                            break;
                        case "15":
                            if (data.agelimit.length >0){
                                html += "<tr><td class='table_td_one'>관람 가능연령</td><td>" + data.agelimit + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>관람 가능연령</td><td>정보없음</td></tr>";
                            }
                            if (data.bookingplace.length >0){
                                html += "<tr><td class='table_td_one'>예매처</td><td>" + data.bookingplace + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>예매처</td><td>정보없음</td></tr>";
                            }
                            if (data.discountinfofestival.length >0){
                                html += "<tr><td class='table_td_one'>할인정보</td><td>" + data.discountinfofestival + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>할인정보</td><td>정보없음</td></tr>";
                            }
                            if (data.eventenddate.length > 0) {
                                html += "<tr><td class='table_td_one'>행사 종료일</td><td>" + data.eventenddate + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>행사 종료일</td><td>정보없음</td></tr>";
                            }
                            if (data.eventhomepage.length > 0) {
                                html += "<tr><td class='table_td_one'>행사 홈페이지</td><td>" + data.eventhomepage + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>행사 홈페이지</td><td>정보없음</td></tr>";
                            }
                            if (data.eventplace.length > 0) {
                                html += "<tr><td class='table_td_one'>행사장소</td><td>" + data.eventplace + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>행사장소</td><td>정보없음</td></tr>";
                            }
                            if (data.eventstartdate.length > 0) {
                                html += "<tr><td class='table_td_one'>행사 시작일</td><td>" + data.eventstartdate + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>행사 시작일</td><td>정보없음</td></tr>";

                            }
                            if (data.festivalgrade.length > 0) {
                                html += "<tr><td class='table_td_one'>축제등급</td><td>" + data.festivalgrade + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>축제등급</td><td>정보없음</td></tr>";
                            }
                            if (data.placeinfo.length > 0) {
                                html += "<tr><td class='table_td_one'>행사장 위치안내</td><td>" + data.placeinfo + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>행사장 위치안내</td><td>정보없음</td></tr>";
                            }
                            if (data.playtime.length >0){
                                html += "<tr><td class='table_td_one'>공연시간</td><td>" + data.playtime + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>공연시간</td><td>정보없음</td></tr>";
                            }
                            if (data.program.length > 0) {
                                html += "<tr><td class='table_td_one'>행사 프로그램</td><td>" + data.program + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>행사 프로그램</td><td>정보없음</td></tr>";
                            }
                            if (data.spendtimefestival.length > 0) {
                                html += "<tr><td class='table_td_one'>관람 소요시간</td><td>" + data.spendtimefestival + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>관람 소요시간</td><td>정보없음</td></tr>";
                            }
                            if (data.sponsor1.length > 0) {
                                html += "<tr><td class='table_td_one'>주최자 정보</td><td>" + data.sponsor1 + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>주최자 정보</td><td>정보없음</td></tr>";
                            }
                            if (data.sponsor1tel.length > 0) {
                                html += "<tr><td class='table_td_one'>주최자 연락처</td><td>" + data.sponsor1tel + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>주최자 연락처</td><td>정보없음</td></tr>";
                            }
                            if (data.sponsor2.length > 0) {
                                html += "<tr><td class='table_td_one'>주관사 정보</td><td>" + data.sponsor2 + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>주관사 정보</td><td>정보없음</td></tr>";
                            }
                            if (data.sponsor2tel.length > 0) {
                                html += "<tr><td class='table_td_one'>주관사 연락처</td><td>" + data.sponsor2tel + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>주관사 연락처</td><td>정보없음</td></tr>";
                            }
                            if (data.subevent.length > 0) {
                                html += "<tr><td class='table_td_one'>부대행사</td><td>" + data.subevent + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>부대행사</td><td>정보없음</td></tr>";
                            }
                            if (data.usetimefestival.length > 0) {
                                html += "<tr><td class='table_td_one'>이용요금</td><td>" + data.usetimefestival + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>이용요금</td><td>정보없음</td></tr>";
                            }
                            break;
                        case "25":
                            if (data.distance.length > 0){
                                html += "<tr><td class='table_td_one'>거리</td><td>" + data.distance + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>거리</td><td>정보없음</td></tr>";
                            }
                            if (data.infocentertourcourse.length > 0) {
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>" + data.infocentertourcourse + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>정보없음</td></tr>";
                            }
                            if (data.schedule.length > 0) {
                                html += "<tr><td class='table_td_one'>행사일정</td><td>" + data.schedule + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>행사일정</td><td>정보없음</td></tr>";
                            }
                            if (data.taketime.length > 0) {
                                html += "<tr><td class='table_td_one'>소요시간</td><td>" + data.taketime + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>소요시간</td><td>정보없음</td></tr>";
                            }
                            if (data.theme.length > 0) {
                                html += "<tr><td class='table_td_one'>코스 테마</td><td>" + data.theme + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>코스 테마</td><td>정보없음</td></tr>";
                            }
                            break;
                        case "28":
                            if (data.accomcountleports.length > 0) {
                                html += "<tr><td class='table_td_one'>수용인원</td><td>" + data.accomcountleports + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>수용인원</td><td>정보없음</td></tr>";
                            }
                            if (data.chkbabycarriageleports.length > 0) {
                                html += "<tr><td class='table_td_one'>유모차대여 정보</td><td>" + data.chkbabycarriageleports + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>유모차대여 정보</td><td>정보없음</td></tr>";
                            }
                            if (data.chkcreditcardleports.length > 0) {
                                html += "<tr><td class='table_td_one'>신용카드가능 정보</td><td>" + data.chkcreditcardleports + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>신용카드가능 정보</td><td>정보없음</td></tr>";
                            }
                            if (data.chkpetleports.length > 0) {
                                html += "<tr><td class='table_td_one'>애완동물동반가능 정보</td><td>" + data.chkpetleports + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>애완동물동반가능 정보</td><td>정보없음</td></tr>";
                            }
                            if (data.expagerangeleports.length > 0) {
                                html += "<tr><td class='table_td_one'>체험가능연령</td><td>" + data.expagerangeleports + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>체험가능연령</td><td>정보없음</td></tr>";
                            }
                            if (data.infocenterleports.length > 0) {
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>" + data.infocenterleports + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>정보없음</td></tr>";
                            }
                            if (data.openperiod.length > 0){
                                html += "<tr><td class='table_td_one'>개장기간</td><td>" + data.openperiod + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>개장기간</td><td>정보없음</td></tr>";
                            }
                            if (data.parkingleports.length > 0) {
                                html += "<tr><td class='table_td_one'>주차시설</td><td>" + data.parkingleports + "</td></tr>";
                                if (data.parkingfeeleports.length > 0){
                                    html += "<tr><td class='table_td_one'>주차요금</td><td>" + data.parkingfeelports + "</td></tr>";
                                } else {
                                    html += "<tr><td class='table_td_one'>주차요금</td><td>정보없음</td></tr>";
                                }
                            } else {
                                html += "<tr><td class='table_td_one'>주차시설</td><td>정보없음</td></tr>";
                            }
                            if (data.reservation.length > 0){
                                html += "<tr><td class='table_td_one'>예약안내</td><td>" + data.reservation + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>예약안내</td><td>정보없음</td></tr>";
                            }
                            if (data.restdateleports.length > 0) {
                                html += "<tr><td class='table_td_one'>쉬는날</td><td>" + data.restdateleports + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>쉬는날</td><td>정보없음</td></tr>";
                            }
                            if (data.scaleleports.length > 0) {
                                html += "<tr><td class='table_td_one'>규모</td><td>" + data.scaleleports + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>규모</td><td>정보없음</td></tr>";
                            }
                            if (data.usefeeleports.length > 0) {
                                html += "<tr><td class='table_td_one'>입장료</td><td>" + data.usefeeleports + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>입장료</td><td>정보없음</td></tr>";
                            }
                            if (data.usetimeleports.length > 0) {
                                html += "<tr><td class='table_td_one'>이용시간</td><td>" + data.usetimeleports + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>이용시간</td><td>정보없음</td></tr>";
                            }
                            break;
                        case "32":
                            if (data.accomcountlodging.length > 0) {
                                html += "<tr><td class='table_td_one'>수용인원</td><td>" + data.accomcountlodging + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>수용인원</td><td>정보없음</td></tr>";
                            }
                            if (data.benikia.length > 0) {
                                html += "<tr><td class='table_td_one'>베니키아 여부</td><td>" + data.benikia + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>베니키아 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.checkintime.length > 0) {
                                html += "<tr><td class='table_td_one'>입실시간</td><td>" + data.checkintime + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>입실시간</td><td>정보없음</td></tr>";
                            }
                            if (data.checkouttime.length > 0) {
                                html += "<tr><td class='table_td_one'>퇴실시간</td><td>" + data.checkouttime + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>퇴실시간</td><td>정보없음</td></tr>";
                            }
                            if (data.chkcooking.length > 0) {
                                html += "<tr><td class='table_td_one'>객실내 취사 여부</td><td>" + data.chkcooking + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>객실내 취사 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.foodplace.length > 0) {
                                html += "<tr><td class='table_td_one'>식음료장</td><td>" + data.foodplace + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>식음료장</td><td>정보없음</td></tr>";
                            }
                            if (data.goodstay.length > 0) {
                                html += "<tr><td class='table_td_one'>굿스테이 여부</td><td>" + data.goodstay + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>굿스테이 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.hanok.length > 0) {
                                html += "<tr><td class='table_td_one'>한옥 여부</td><td>" + data.hanok + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>한옥 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.infocenterlodging.length > 0) {
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>" + data.infocenterlodging + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>정보없음</td></tr>";
                            }
                            if (data.parkinglodging.length > 0) {
                                html += "<tr><td class='table_td_one'>주차시설</td><td>" + data.parkinglodging + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>주차시설</td><td>정보없음</td></tr>";
                            }
                            if (data.pickup.length > 0) {
                                html += "<tr><td class='table_td_one'>픽업 서비스</td><td>" + data.pickup + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>픽업 서비스</td><td>정보없음</td></tr>";
                            }
                            if (data.roomcount.length > 0) {
                                html += "<tr><td class='table_td_one'>객실수</td><td>" + data.roomcount + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>객실수</td><td>정보없음</td></tr>";
                            }
                            if (data.reservationlodging.length > 0) {
                                html += "<tr><td class='table_td_one'>예약안내</td><td>" + data.reservationlodging + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>예약안내</td><td>정보없음</td></tr>";
                            }
                            if (data.reservationurl.length > 0) {
                                html += "<tr><td class='table_td_one'>예약안내 홈페이지</td><td>" + data.reservationurl + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>예약안내 홈페이지</td><td>정보없음</td></tr>";
                            }
                            if (data.roomtype.length > 0) {
                                html += "<tr><td class='table_td_one'>객실유형</td><td>" + data.roomtype + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>객실유형</td><td>정보없음</td></tr>";
                            }
                            if (data.scalelodging.length > 0) {
                                html += "<tr><td class='table_td_one'>규모</td><td>" + data.scalelodging + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>규모</td><td>정보없음</td></tr>";
                            }
                            if (data.subfacility.length > 0) {
                                html += "<tr><td class='table_td_one'>부대시설</td><td>" + data.subfacility + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>부대시설</td><td>정보없음</td></tr>";
                            }
                            if (data.barbecue.length > 0) {
                                html += "<tr><td class='table_td_one'>바비큐장 여부</td><td>" + data.barbecue + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>바비큐장 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.beauty.length > 0) {
                                html += "<tr><td class='table_td_one'>뷰티시설</td><td>" + data.beauty + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>뷰티시설</td><td>정보없음</td></tr>";
                            }
                            if (data.beverage.length > 0) {
                                html += "<tr><td class='table_td_one'>식음료장 여부</td><td>" + data.beverage + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>식음료장 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.bicycle.length > 0) {
                                html += "<tr><td class='table_td_one'>자전거 대여 여부</td><td>" + data.bicycle + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>자전거 대여 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.campfire.length > 0) {
                                html += "<tr><td class='table_td_one'>캠프파이어 여부</td><td>" + data.campfire + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>캠프파이어 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.fitness.length > 0) {
                                html += "<tr><td class='table_td_one'>피트니스 센터</td><td>" + data.fitness + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>피트니스 센터</td><td>정보없음</td></tr>";
                            }
                            if (data.karaoke.length > 0) {
                                html += "<tr><td class='table_td_one'>노래방 여부</td><td>" + data.karaoke + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>노래방 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.publicbath.length > 0) {
                                html += "<tr><td class='table_td_one'>공용 샤워실</td><td>" + data.publicbath + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>공용 샤워실</td><td>정보없음</td></tr>";
                            }
                            if (data.publicpc.length > 0) {
                                html += "<tr><td class='table_td_one'>공용 PC</td><td>" + data.publicpc + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>공용 PC</td><td>정보없음</td></tr>";
                            }
                            if (data.sauna.length > 0) {
                                html += "<tr><td class='table_td_one'>사우나실 여부</td><td>" + data.sauna + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>사우나실 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.seminar.length > 0) {
                                html += "<tr><td class='table_td_one'>세미나실 여부</td><td>" + data.seminar + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>세미나실 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.sports.length > 0) {
                                html += "<tr><td class='table_td_one'>스포츠 시설</td><td>" + data.sports + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>스포츠 시설</td><td>정보없음</td></tr>";
                            }
                            if (data.refundregulation.length > 0) {
                                html += "<tr><td class='table_td_one'>환불규정</td><td>" + data.refundregulation + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>환불규정</td><td>정보없음</td></tr>";
                            }
                            break;
                        case "38":
                            if (data.chkbabycarriageshopping.length > 0) {
                                html += "<tr><td class='table_td_one'>유모차대여 여부</td><td>" + data.chkbabycarriageshopping + "</td></tr>";
                            } else {
                                html += "<tr><td class='table_td_one'>유모차대여 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.chkcreditcardshopping.length > 0) {
                                html += "<tr><td class='table_td_one'>신용카드 가능 여부</td><td>" + data.chkcreditcardshopping + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>신용카드 가능 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.chkpetshopping.length > 0) {
                                html += "<tr><td class='table_td_one'>애완동물 가능 여부</td><td>" + data.chkpetshopping + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>애완동물 가능 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.culturecenter.length > 0) {
                                html += "<tr><td class='table_td_one'>문화센터</td><td>" + data.culturecenter + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>문화센터</td><td>정보없음</td></tr>";
                            }
                            if (data.fairday.length > 0) {
                                html += "<tr><td class='table_td_one'>장서는 날</td><td>" + data.fairday + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>장서는 날</td><td>정보없음</td></tr>";
                            }
                            if (data.infocentershopping.length > 0) {
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>" + data.infocentershopping + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>정보없음</td></tr>";
                            }
                            if (data.opendateshopping.length > 0) {
                                html += "<tr><td class='table_td_one'>개장일</td><td>" + data.opendateshopping + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>개장일</td><td>정보없음</td></tr>";
                            }
                            if (data.opentime.length > 0) {
                                html += "<tr><td class='table_td_one'>영업시간</td><td>" + data.opentime + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>영업시간</td><td>정보없음</td></tr>";
                            }
                            if (data.parkingshopping.length > 0) {
                                html += "<tr><td class='table_td_one'>주차시설</td><td>" + data.parkingshopping + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>주차시설</td><td>정보없음</td></tr>";
                            }
                            if (data.restdateshopping.length > 0) {
                                html += "<tr><td class='table_td_one'>쉬는날</td><td>" + data.restdateshopping + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>쉬는날</td><td>정보없음</td></tr>";
                            }
                            if (data.restroom.length > 0) {
                                html += "<tr><td class='table_td_one'>화장실</td><td>" + data.restroom + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>화장실</td><td>정보없음</td></tr>";
                            }
                            if (data.saleitem.length > 0) {
                                html += "<tr><td class='table_td_one'>판매 품목</td><td>" + data.saleitem + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>판매 품목</td><td>정보없음</td></tr>";
                            }
                            if (data.saleitemcost.length > 0) {
                                html += "<tr><td class='table_td_one'>판매 품목별 가격</td><td>" + data.saleitemcost + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>판매 품목별 가격</td><td>정보없음</td></tr>";
                            }
                            if (data.scaleshopping.length > 0) {
                                html += "<tr><td class='table_td_one'>규모</td><td>" + data.scaleshopping + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>규모</td><td>정보없음</td></tr>";
                            }
                            if (data.shopguide.length > 0) {
                                html += "<tr><td class='table_td_one'>매장안내</td><td>" + data.shopguide + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>매장안내</td><td>정보없음</td></tr>";
                            }
                            break;
                        case "39":
                            if (data.chkcreditcardfood.length > 0){
                                html += "<tr><td class='table_td_one'>신용카드 가능 여부</td><td>" + data.chkcreditcardfood + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>신용카드 가능 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.discountinfofood.length > 0){
                                html += "<tr><td class='table_td_one'>할인정보</td><td>" + data.discountinfofood + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>할인정보</td><td>정보없음</td></tr>";
                            }
                            if (data.firstmenu.length > 0){
                                html += "<tr><td class='table_td_one'>대표메뉴</td><td>" + data.firstmenu + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>대표메뉴</td><td>정보없음</td></tr>";
                            }
                            if (data.infocenterfood.length > 0){
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>" + data.infocenterfood + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>문의 및 안내</td><td>정보없음</td></tr>";
                            }
                            if (data.kidsfacility.length > 0){
                                html += "<tr><td class='table_td_one'>어린이 놀이방 여부</td><td>" + data.kidsfacility + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>어린이 놀이방 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.opendatefood.length > 0){
                                html += "<tr><td class='table_td_one'>개업일</td><td>" + data.opendatefood + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>개업일</td><td>정보없음</td></tr>";
                            }
                            if (data.opentimefood.length > 0){
                                html += "<tr><td class='table_td_one'>영업시간</td><td>" + data.opentimefood + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>영업시간</td><td>정보없음</td></tr>";
                            }
                            if (data.packing.length > 0){
                                html += "<tr><td class='table_td_one'>포장 가능 여부</td><td>" + data.packing + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>포장 가능 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.parkingfood.length > 0){
                                html += "<tr><td class='table_td_one'>주차시설</td><td>" + data.parkingfood + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>주차시설</td><td>정보없음</td></tr>";
                            }
                            if (data.reservationfood.length > 0){
                                html += "<tr><td class='table_td_one'>예약안내</td><td>" + data.reservationfood + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>예약안내</td><td>정보없음</td></tr>";
                            }
                            if (data.restdatefood.length > 0){
                                html += "<tr><td class='table_td_one'>쉬는날</td><td>" + data.restdatefood + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>쉬는날</td><td>정보없음</td></tr>";
                            }
                            if (data.scalefood.length > 0){
                                html += "<tr><td class='table_td_one'>규모</td><td>" + data.scalefood + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>규모</td><td>정보없음</td></tr>";
                            }
                            if (data.seat.length > 0){
                                html += "<tr><td class='table_td_one'>좌석수</td><td>" + data.seat + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>좌석수</td><td>정보없음</td></tr>";
                            }
                            if (data.smoking.length > 0){
                                html += "<tr><td class='table_td_one'>금연/흡연 여부</td><td>" + data.smoking + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>금연/흡연 여부</td><td>정보없음</td></tr>";
                            }
                            if (data.treatmenu.length > 0){
                                html += "<tr><td class='table_td_one'>취급 메뉴</td><td>" + data.treatmenu + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>취급 메뉴</td><td>정보없음</td></tr>";
                            }
                            if (data.lcnsno.length > 0){
                                html += "<tr><td class='table_td_one'>인허가번호</td><td>" + data.lcnsno + "</td></tr>";
                            }else{
                                html += "<tr><td class='table_td_one'>인허가번호</td><td>정보없음</td></tr>";
                            }
                    }
                } else {
                    html += "<tr><td class='table_td_one'>정보없음</td></tr>";
                }
                html += "</table>";
                $("#info_table").html(html);
            },
            complete: function () {
                $("#loadingdiv").hide();
                $("#info_one").css("display", "none");
                $("#info_two").css("display", "block");
            }
        })
    }
}
