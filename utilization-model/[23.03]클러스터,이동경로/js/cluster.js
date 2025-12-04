/*
클러스터 데이터 임의 생성(검색 API)
중복 코드 정비 필요
1동, 2동, 3동, 4동 검색 데이터로 임의 클러스터 데이터 생성
*/

let features = new Array();
         
let styleCache1 = new Array();
let styleCache2 = new Array();
let styleCache3 = new Array();
let styleCache4 = new Array();

let cluster = function(sv,tid){
    $('[name=size]').val(1000);
    var rc,gc,bc,ic;
    if(sv!=null){
        $('[name=query]').val(sv)
    }

    if(sv.indexOf('4')>-1){
        rc=255 ;
        bc=100;
        gc=100;
        ic ='https://www.vworld.kr/images/v4cm/comm/v3symbol/symbol_08_small.png'; 
    }else if(sv.indexOf('3')>-1){
        rc=100 ;
        bc=100;
        gc=255;
        ic ='https://www.vworld.kr/images/v4cm/comm/v3symbol/symbol_03_small.png'; 
    }else if(sv.indexOf('2')>-1){
        rc=200 ;
        bc=255;
        gc=100;
        ic ='https://www.vworld.kr/images/v4cm/comm/v3symbol/symbol_07_small.png'; 
    }else if(sv.indexOf('1')>-1){
        rc=0 ;
        bc=246;
        gc=0;
        ic ='https://www.vworld.kr/images/v4cm/comm/v3symbol/symbol_09_small.png'; 
    }
    //색상 설정
    // #4997f6 rgb(73, 151, 246) 블루  #1000ff rgb(16, 0, 255)
    // #f64949 rgb(246, 73, 73)  레드  #ff1100 rgb(255, 17, 0)
    // #4cf649 rgb(76, 246, 73)  그린  #4caf50 rgb(76, 175, 80)
    // #a349f6 rgb(163, 73, 246) 보라  #9c27b0 rgb(156, 39, 176)
    

    $.ajax({
        type: "get",
        url: "https://api.vworld.kr/req/search",
        data : $('#searchForm').serialize(),
        dataType: 'jsonp',
        async: false,
        success: function(data) {


            //마커 설정을 위한 feature 배열 생성
            for(let o in data.response.result.items){ 
                if(o==0){
                    move(data.response.result.items[o].point.x*1,data.response.result.items[o].point.y*1);
                }
                //Feature 객체에 저장하여 활용 
   

                features[o] = new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.transform([ data.response.result.items[o].point.x*1,data.response.result.items[o].point.y*1],'EPSG:4326', "EPSG:900913")),
                    title: data.response.result.items[o].title,
                    parcel: data.response.result.items[o].address.parcel,
                    road: data.response.result.items[o].address.road,
                    category: data.response.result.items[o].category,
                    point: data.response.result.items[o].point,
                    color : `rgb(${rc}, ${gc}, ${bc}, 0.5)`,
                });
                //features[o].set('color',`rgba(${rc}, ${gc}, ${bc}, 0.7)`)
                features[o].set("id",data.response.result.items[o].id);
            }
             
            
            let vectorSource = new ol.source.Vector({
                  features: features
            });
            
            //클러스터 설정  distance 로 거리 설정
            let clusterSource = new ol.source.Cluster({
                distance: 40,
                source: vectorSource
            });
            
            //클러스터 레이어 생성
            let clusters = new ol.layer.Vector({
                source: clusterSource,
                style: function(feature) {
                    
                    let size = feature.get('features').length;
                    let ccolor = feature.get('features')[0].get('color');
                    if(size>10)
                    ccolor = ccolor.replace('0.5)','1)')
                    var ci = null;
                    if(size>1){
                        ci = new ol.style.Circle({
                            radius: 10,
                            stroke: new ol.style.Stroke({
                            color: '#fff'
                            }),
                            fill: new ol.style.Fill({
                            color: ccolor
                            })
                        })
                    }else{

                        ci = new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                            anchor: [0.5, 26],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            src: ic
                        }))
                    }

                    let style;
                    if(sv.indexOf('4')>-1){
                        style = styleCache4[size];

                        if (!style) {
                                style = new ol.style.Style({
                                    image: ci,
                                    text: new ol.style.Text({
                                    text: size== 1 ? '':size.toString()+`명`, // 모인 숫자를 표기
                                    fill: new ol.style.Fill({
                                        color: '#fff'
                                    })
                                })
                            });
                            styleCache4[size] = style;
                        }
                    }else if(sv.indexOf('3')>-1){
                        style = styleCache3[size];

                        if (!style) {
                                style = new ol.style.Style({
                                    image: ci,
                                    text: new ol.style.Text({
                                    text: size== 1 ? '':size.toString()+`명`, // 모인 숫자를 표기
                                    fill: new ol.style.Fill({
                                        color: '#fff'
                                    })
                                })
                            });
                            styleCache3[size] = style;
                        }
                    }else if(sv.indexOf('2')>-1){
                        style = styleCache2[size];

                        if (!style) {
                                style = new ol.style.Style({
                                    image: ci,
                                    text: new ol.style.Text({
                                    text: size== 1 ? '':size.toString()+`명`, // 모인 숫자를 표기
                                    fill: new ol.style.Fill({
                                        color: '#fff'
                                    })
                                })
                            });
                            styleCache2[size] = style;
                        }
                    }else{
                        style = styleCache1[size];

                        if (!style) {
                                style = new ol.style.Style({
                                    image: ci,
                                    text: new ol.style.Text({
                                    text: size== 1 ? '':size.toString()+`명`, // 모인 숫자를 표기
                                    fill: new ol.style.Fill({
                                        color: '#fff'
                                    })
                                })
                            });
                            styleCache1[size] = style;
                        }
                    }
                       
                    return style;
                }
            });
             
            /*
                    기존검색결과를 제거하기 위해 키 값 생성
            */
            clusters.set("name",tid)
             
            map.getLayers().forEach(function(layer){
                if(layer.get("name")==tid){
                    map.removeLayer(layer);
                }
            });
             
            map.addLayer(clusters);
        },
        error: function(xhr, stat, err) {}
    });
     

}

var triggerChk = function(value){
    $(`#${value}_check`).trigger('click')
  }
 
let move = function(x,y){//127.10153, 37.402566
    map.getView().setCenter(ol.proj.transform([ x, y ],'EPSG:4326', "EPSG:900913")); // 지도 이동
    map.getView().setZoom(12);
}

//오버레이 삭제
let deleteOverlay = function(id){
    map.removeOverlay(map.getOverlayById(id));
}