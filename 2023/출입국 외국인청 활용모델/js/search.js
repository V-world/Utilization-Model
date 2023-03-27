var search = function(){
    $('[name=size]').val(10);
    $.ajax({
        type: "get",
        url: "https://api.vworld.kr/req/search",
        data : $('#searchForm').serialize(),
        dataType: 'jsonp',
        async: false,
        success: function(data) {
            var resultHtml = "";
            if(data.response.status =="NOT_FOUND"){
                resultHtml=`<li>검색결과가 없습니다.</li>`;
                $('#search_result').html(resultHtml);
                return;
            }

            for(var o in data.response.result.items){ 
                let mx = data.response.result.items[o].point.x*1;
                let my = data.response.result.items[o].point.y*1;
                if(o==0){
                    move(mx,my);
                }
                var title=data.response.result.items[o].title;// map.getLayerNmElement( title ) 제어 가능
                var bldnm = data.response.result.items[o].address.bldnm;
                var parcel = data.response.result.items[o].address.parcel;
                var road = data.response.result.items[o].address.road;
                //Feature 객체에 저장하여 활용 
                features[o] = new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.transform([ data.response.result.items[o].point.x*1,data.response.result.items[o].point.y*1],'EPSG:4326', "EPSG:900913")),
                    title: title,
                    parcel: parcel,
                    road: road,
                    category: data.response.result.items[o].category,
                    bldnm:bldnm,
                    point: data.response.result.items[o].point
                });
                features[o].set("id",data.response.result.items[o].id);
                 
                var iconStyle = new ol.style.Style({
                    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                        anchor: [0.5, 46],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        src: 'https://map.vworld.kr/images/ol3/marker_blue.png'
                    }))
                });
                features[o].setStyle(iconStyle);
                var text='';
                if($('[name=type]').val()=='PLACE'){
                    text=`${title}`
                }else if($('[name=category]').val()=='road'){
                    text=`${road}`
                }else if($('[name=category]').val()=='parcel'){
                    text=`${parcel}`
                }
                resultHtml += `<li><a href='#' onclick='move(${mx},${my},500)'>${text}</a></li>`;
                 
            }
             
            var vectorSource = new ol.source.Vector({
                  features: features
            });
            /*
                기존검색결과를 제거하기 위해 키 값 생성
            */
            var vectorLayer = new ol.layer.Vector({
                source: vectorSource
            });
             
            /*
                기존검색결과를 제거하기 위해 키 값 생성
            */
            vectorLayer.set("name","search_vector")
             
            map.getLayers().forEach(function(layer){
                if(layer.get("name")=="search_vector"){
                    map.removeLayer(layer);
                }
            });
             
            map.addLayer(vectorLayer);
            $('#search_result').html(resultHtml);
        },
        error: function(xhr, stat, err) {}
    });
}