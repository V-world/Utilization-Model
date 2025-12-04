
/**
 * 데이터 API를 이용하여 행정구역 목록 조회
 */

$.support.cors = true;
	
$(function(){
    $.ajax({ //광역시도 초기화
        type: "get",
        url: "https://api.vworld.kr/req/data?key=CEB52025-E065-364C-9DBA-44880E3B02B8&domain=http://localhost:8080&service=data&version=2.0&request=getfeature&format=json&size=1000&page=1&geometry=false&attribute=true&crs=EPSG:3857&geomfilter=BOX(13663271.680031825,3894007.9689600193,14817776.555251127,4688953.0631258525)&data=LT_C_ADSIDO_INFO",
        async: false,
        dataType: 'jsonp',
        success: function(data) {
            let html = "<option>선택</option>";

            data.response.result.featureCollection.features.forEach(function(f){
                //console.log(f.properties)
                let targetName = "sig_cd";
                let 행정구역코드 = f.properties.ctprvn_cd;
                let 행정구역명 = f.properties.ctp_kor_nm;

                html +=`<option value="${행정구역코드}">${행정구역명}(${행정구역코드})</option>`
                
            })
            
            $('#sido_code').html(html);
            
        },
        error: function(xhr, stat, err) {}
    });
    
    //광역시도 검색
    $(document).on("change","#sido_code",function(){
        let thisVal = $(this).val();		

        var targetName = "ctprvn_cd";
        var targetCode = thisVal;
        //callAjax("LT_C_ADSIDO_INFO",targetName,targetCode);
        if(thisVal=='선택') return;
        $.ajax({
            type: "get",
            url: "https://api.vworld.kr/req/data?key=CEB52025-E065-364C-9DBA-44880E3B02B8&domain=http://localhost:8080&service=data&version=2.0&request=getfeature&format=json&size=1000&page=1&attribute=true&crs=EPSG:3857&geomfilter=BOX(13663271.680031825,3894007.9689600193,14817776.555251127,4688953.0631258525)&data=LT_C_ADSIGG_INFO",
            data : {attrfilter : 'sig_cd:like:'+thisVal},
            async: false,
            dataType: 'jsonp',
            success: function(data) {
                let vectorSource = new ol.source.Vector({features: (new ol.format.GeoJSON()).readFeatures(data.response.result.featureCollection)})
                
                // ol.format.GeoJSON()).readFeatures Openlayers에서 제공하는 파서

                let html = "<option>선택</option>";
                var resultHtml = "";
                vectorSource.getFeatures().forEach(function(f){
                    //console.log(f.properties)
                    let 행정구역코드 = f.get("sig_cd")
                    let 행정구역명 = f.get("sig_kor_nm");
                    let r = Math.round(Math.random() * 255);
                    let g = Math.round(Math.random() * 255);
                    let b = Math.round(Math.random() * 255);
                    f.set('color',`rgba(${r}, ${g}, ${b}, .7)`)
                    let cnt = `${r}${g}${b}`;
                    f.set('cnt',cnt)
                    html +=`<option value="${행정구역코드}">${행정구역명}(${행정구역코드})</option>`

                    //객체의 범위 값에서 중앙값 확인 
                    let mx = (f.getGeometry().getExtent()[0]+f.getGeometry().getExtent()[2])/2;
                    let my = (f.getGeometry().getExtent()[1]+f.getGeometry().getExtent()[3])/2;
                    let cmxy =  ol.proj.transform([mx,my], "EPSG:900913",'EPSG:4326');

                    resultHtml+= `<li><a href='#' onclick='move(${cmxy[0]},${cmxy[1]})'>${행정구역명}(코드:${행정구역코드})(통계값:${cnt})</a></li>`;
                })

                $('#sigoon_code').html(html);

                var bbox = data.response.result.featureCollection.bbox;
                var layer = "LT_C_ADSIDO_INFO";

                
                map.getLayers().forEach(function(layer){
                    if(layer.get("name")=="search_result"){
                        map.removeLayer(layer);//기존결과 삭제
                    }
                })
                let  vector_layer = new ol.layer.Vector({
                    source: vectorSource,
                    style: styleFunction
                })
                
                vector_layer.set("name","search_result");
                map.addLayer(vector_layer); // 지도 레이어에 데이터 API 호출결과 추가

                vectorSource.getFeatures().forEach(function(f){
                    console.log(f.get("color"))

                    
                })
                $('#code_result').html(resultHtml);
            },
            error: function(xhr, stat, err) {}
        });
    });
    //시군코드 검색
    $(document).on("change","#sigoon_code",function(){ 
        
        let thisVal = $(this).val();
        if(thisVal=='선택') return;		
        var targetName = "sig_cd";
        var targetCode = thisVal;

        $.ajax({
            type: "get",
            url: "https://api.vworld.kr/req/data?key=CEB52025-E065-364C-9DBA-44880E3B02B8&domain=http://localhost:8080&service=data&version=2.0&request=getfeature&format=json&size=1000&page=1&geometry=true&attribute=true&crs=EPSG:3857&geomfilter=BOX(13663271.680031825,3894007.9689600193,14817776.555251127,4688953.0631258525)&data=LT_C_ADEMD_INFO",
            data : {attrfilter : 'emd_cd:like:'+thisVal},
            async: false,
            dataType: 'jsonp',
            success: function(data) {
                let vectorSource = new ol.source.Vector({features: (new ol.format.GeoJSON()).readFeatures(data.response.result.featureCollection)})
                
                // ol.format.GeoJSON()).readFeatures Openlayers에서 제공하는 파서
                var resultHtml = "";
                map.getLayers().forEach(function(layer){
                    if(layer.get("name")=="search_result"){
                        map.removeLayer(layer);//기존결과 삭제
                    }
                })
                let  vector_layer = new ol.layer.Vector({
                    source: vectorSource,
                    style: styleFunction
                })
                
                vector_layer.set("name","search_result");
                map.addLayer(vector_layer); // 지도 레이어에 데이터 API 호출결과 추가

                let html = "<option>선택</option>";

                vectorSource.getFeatures().forEach(function(f){
                    //console.log(f.properties)
                    let 행정구역코드 = f.get("emd_cd")
                    let 행정구역명 = f.get("emd_kor_nm");
                    
                    let r = Math.round(Math.random() * 255);
                    let g = Math.round(Math.random() * 255);
                    let b = Math.round(Math.random() * 255);
                    f.set('color',`rgba(${r}, ${g}, ${b}, .7)`)
                    let cnt = `${r}${g}${b}`;
                    f.set('cnt',cnt)
                    let mx = (f.getGeometry().getExtent()[0]+f.getGeometry().getExtent()[2])/2;
                    let my = (f.getGeometry().getExtent()[1]+f.getGeometry().getExtent()[3])/2;
                    let cmxy =  ol.proj.transform([mx,my], "EPSG:900913",'EPSG:4326');
                    html +=`<option value="${행정구역코드}">${행정구역명}(${행정구역코드})</option>`
                    resultHtml+= `<li><a href='#' onclick='move(${cmxy[0]},${cmxy[1]})'>${행정구역명}(코드:${행정구역코드})(통계값:${cnt})</a></li>`;
                })

                $('#dong_code').html(html);	
                $('#code_result').html(resultHtml);
            },
            error: function(xhr, stat, err) {}
        });

    });

    // 읍면 코드로 검색
    $(document).on("change","#dong_code",function(){ 
        let thisVal = $(this).val();	
        if(thisVal=='선택') return;
        var targetName = "emd_cd";
        var targetCode = thisVal;
        //callAjax("LT_C_ADEMD_INFO",targetName,targetCode);
        
        $.ajax({
            type: "get",
            url: "https://api.vworld.kr/req/data?key=CEB52025-E065-364C-9DBA-44880E3B02B8&domain=http://localhost:8080&service=data&version=2.0&request=getfeature&format=json&size=1000&page=1&geometry=true&attribute=true&crs=EPSG:3857&geomfilter=BOX(13663271.680031825,3894007.9689600193,14817776.555251127,4688953.0631258525)&data=LT_C_ADRI_INFO",
            data : {attrfilter : 'li_cd:like:'+thisVal},
            async: false,
            dataType: 'jsonp',
            success: function(data) {
                var resultHtml="";
                let vectorSource = new ol.source.Vector({features: (new ol.format.GeoJSON()).readFeatures(data.response.result.featureCollection)})
                
                // ol.format.GeoJSON()).readFeatures Openlayers에서 제공하는 파서

                map.getLayers().forEach(function(layer){
                    if(layer.get("name")=="search_result"){
                        map.removeLayer(layer);//기존결과 삭제
                    }
                })
                let  vector_layer = new ol.layer.Vector({
                    source: vectorSource,
                    style: styleFunction
                })
                
                vector_layer.set("name","search_result");
                map.addLayer(vector_layer); // 지도 레이어에 데이터 API 호출결과 추가


                let html = "<option>선택</option>";
                if(data.response.status=='NOT_FOUND') return;

                vectorSource.getFeatures().forEach(function(f){
                    //console.log(f.properties)
                    let 행정구역코드 = f.get("li_cd")
                    let 행정구역명 = f.get("li_kor_nm");
                    let r = Math.round(Math.random() * 255);
                    let g = Math.round(Math.random() * 255);
                    let b = Math.round(Math.random() * 255);
                    f.set('color',`rgba(${r}, ${g}, ${b}, .7)`)
                    f.set('cnt',`${r}${g}${b}`)
                    html +=`<option value="${행정구역코드}">${행정구역명}(${행정구역코드})</option>`
                })
       
                $('#lee_code').html(html);
            },
            error: function(xhr, stat, err) {}
        });

    });
})

//공간정보를 올리기 위한 폴리곤 조회
var callAjax = function(data,targetName,targetCode){

    $.ajax({
            type: "get",
            url: `https://api.vworld.kr/req/data?key=CEB52025-E065-364C-9DBA-44880E3B02B8&domain=http://localhost:8080&service=data&version=2.0&request=getfeature&format=json&size=1000&page=1&geometry=true&attribute=true&crs=EPSG:3857&data=${data}&attrfilter=${targetName}:like:${targetCode}`,
            async: false,
            dataType: 'jsonp',
            success: function(data) {
                let vectorSource = new ol.source.Vector({features: (new ol.format.GeoJSON()).readFeatures(data.response.result.featureCollection)})
                
                // ol.format.GeoJSON()).readFeatures Openlayers에서 제공하는 파서

                map.getLayers().forEach(function(layer){
                    if(layer.get("name")=="search_result"){
                        map.removeLayer(layer);//기존결과 삭제
                    }
                })
                let  vector_layer = new ol.layer.Vector({
                    source: vectorSource,
                    style: styleFunction
                })
                
                vector_layer.set("name","search_result");
                map.addLayer(vector_layer); // 지도 레이어에 데이터 API 호출결과 추가
                
            },
            error: function(xhr, stat, err) {}
    });
}


  /* 폴리곤의 스타일 설정 */
function styleFunction(feature) {

return [
new ol.style.Style({
    fill: new ol.style.Fill({ // 광역 시군 읍면에 따른 색상 변경
    //color: feature.get('ctp_kor_nm') == null ? feature.get('sig_kor_nm')==null? 'rgba(255,0,0,0.4)' : 'rgba(0,0,255,0.4)': 'rgba(0,255,0,0.4)'//'rgba(255,0,255,0.4)'
    color: feature.get('color')
    }),
    stroke: new ol.style.Stroke({
    color: '#3399CC',//'#3399CC',
    width: 1.25
    }),
    text: new ol.style.Text({
        offsetX:0.5, //위치설정
        offsetY:20,   //위치설정
        font: '20px Calibri,sans-serif',
        fill: new ol.style.Fill({ color: `rgba(0, 0, 0, .7)` }),
        stroke: new ol.style.Stroke({
            color: '#fff', width: 3
        }),
        //text: feature.get('ctp_kor_nm') == null ? feature.get('sig_kor_nm')==null? feature.get('emd_kor_nm') : feature.get('sig_kor_nm'): feature.get('ctp_kor_nm')
        text: feature.get('ctp_kor_nm') == null ? feature.get('sig_kor_nm')==null? feature.get('emd_kor_nm')+"("+feature.get('cnt')+")": feature.get('sig_kor_nm')+"("+feature.get('cnt')+")": feature.get('ctp_kor_nm')+"("+feature.get('cnt')+")"
    }),
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        anchor: [0.5, 10],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: 'http://map.vworld.kr/images/ol3/marker_blue.png'
    }))
})
];
}