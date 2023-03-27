


let route = function(qvalue){
    $('[name=type]').val('PLACE');
    $('[name=category]').val('');
    $('[name=query]').val(qvalue);
    $('[name=size]').val(50);
	let rfeatures =  new Array();
    let rcoordinates = []; //좌표 설정
	$.ajax({
		type: "get",
		url: "https://api.vworld.kr/req/search",
		data : $('#searchForm').serialize(),
		dataType: 'jsonp',
		async: false,
		success: function(data) {
			if(data.response.status =="NOT_FOUND"){
				alert("검색결과가 없습니다.");
			}else{
                var resultHtml = "";
				for(let o in data.response.result.items){ 
                    let mx = data.response.result.items[o].point.x*1;
                    let my = data.response.result.items[o].point.y*1;
					let coor = ol.proj.transform([ mx,my],'EPSG:4326', "EPSG:900913");					
					rcoordinates.push(coor);
                    var title=data.response.result.items[o].title
					let num = ((o*1)+1);
					feature = new ol.Feature({
						geometry: new ol.geom.Point(coor),
						number : num+""
					});
					rfeatures.push(feature);
                    var text = `${num}번째 ${title}방문`;
                    resultHtml += `<li><a href='javascript:;' onclick='move(${mx},${my})'>${text}</a></li>`
				}
			}
			let polygon_feature = new ol.Feature({
				geometry : new ol.geom.LineString(rcoordinates),
				name:"라인스트링"
			}); 
            let r = Math.round(Math.random() * 255);
            let g = Math.round(Math.random() * 255);
            let b = Math.round(Math.random() * 255);
			let vector_layer = new ol.layer.Vector({
				source : new ol.source.Vector({
					features : [ polygon_feature ]
				}),
				변수:"변수선언",
                style : function(feature) {
                
                    let styleR = new ol.style.Style({
                        stroke : new ol.style.Stroke({
                            color : `rgba(${r}, ${g}, ${b}, .7)`,
                            width : 10 //두께
                        }),
                        text: new ol.style.Text({
                            offsetX:0, //위치설정
                            offsetY:0,   //위치설정
                            font: '12px Calibri,sans-serif',
                            fill: new ol.style.Fill({ color: '#000' }),
                            stroke: new ol.style.Stroke({
                            color: '#fff', width: 2
                            }),
                            text: feature.get("number")
                        })   
                    }); // 스타일 설정
                    return styleR;
                }
			})
			
			vector_layer.getSource().addFeatures(rfeatures);
			
			
			
            map.getLayers().forEach(function(layer){ //기존검색결과 제거 
                if(layer.get("변수")=="변수선언"){
                    map.removeLayer(layer);
                }
            });
			map.addLayer(vector_layer); // 폴리곤 객체 등록
            $('#route_detail_result').html(resultHtml);
		},
		error: function(xhr, stat, err) {}
	});
}