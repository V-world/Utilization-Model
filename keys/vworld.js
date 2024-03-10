// API 키 값 저장
apikey = "CEB52025-E065-364C-9DBA-44880E3B02B8"; //이 인증키를 개발 및 운영에 사용하지마세요.
// 위성 지도 레이어 정의
let Satellite = new ol.layer.Tile({
    name: "Satellite",
    type: "tile",
    source: new ol.source.XYZ({
        url: "https://api.vworld.kr/req/wmts/1.0.0/CEB52025-E065-364C-9DBA-44880E3B02B8/Satellite/{z}/{y}/{x}.jpeg"
    })
});
let White = new ol.layer.Tile({
    name: "White",
    type: "tile",
    source: new ol.source.XYZ({
        url: "https://api.vworld.kr/req/wmts/1.0.0/CEB52025-E065-364C-9DBA-44880E3B02B8/white/{z}/{y}/{x}.png"
    })
});
let midNight = new ol.layer.Tile({
    name: "midNight",
    type: "tile",
    source: new ol.source.XYZ({
        url: "https://api.vworld.kr/req/wmts/1.0.0/CEB52025-E065-364C-9DBA-44880E3B02B8/midnight/{z}/{y}/{x}.png"
    })
});
let Base = new ol.layer.Tile({
    name: "Base",
    type: "tile",
    source: new ol.source.XYZ({
        url: "https://api.vworld.kr/req/wmts/1.0.0/CEB52025-E065-364C-9DBA-44880E3B02B8/Base/{z}/{y}/{x}.png"
    })
});
