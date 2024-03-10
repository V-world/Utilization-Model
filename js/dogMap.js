$('input[name="layerswitch_dogMap"]').change(function() {

	if($(this).is(':checked')) {
		let wms_tile = new ol.layer.Tile({
			name : $(this).attr('data-name'),
			id: $(this).attr('data-idn'),
			type: 'layers_dogMap',
			source : new ol.source.TileWMS({
				url : "https://2d.vworld.kr/2DCache/gis/map/WMS2",
				params : {
					LAYERS : $(this).attr('data-idn'),
					CRS : "EPSG:3857",
					apikey : apikey,
					FORMAT : "image/png",
				}
			})
		});
		vmap.addLayer(wms_tile);
	} else {
		vmap.getLayers().forEach(function(layer) {
			if (layer.get('name') === $(this).attr('data-name')) {
				vmap.removeLayer(layer);
			}
		});
	}
});

vmap.on('click', function(evt) {
	/** selectContent 은 어떤 메뉴가 선택되었는지 구분하는 변수**/
	if (selectContent !== 'dogMap') {return;}

	const _coord = evt.coordinate;
	const _areabox = 1000
	const _bbox = [_coord[0]-_areabox, _coord[1]-_areabox, _coord[0]+_areabox, _coord[1]+_areabox];
	$.ajax({
		type: "GET",
		url: "https://api.vworld.kr/req/data",
		data:{
			service: "data",
			request: "GetFeature",
			data: "LT_C_DOGPARK",
			key: apikey,
			format: "json",
			geomFilter: "BOX(" + _bbox + ")",
			crs: vmap.getView().getProjection().getCode(),
		},
		dataType: "jsonp",
		async: false,
		jsonpCallback: "parseResponse",
		success: function (data) {
			console.log('넘어옴')
			if (data.response.status === "OK") return function (){
				console.log('있음')
				console.log(data.response.result.featureCollection.features[0])
				//data.response.result.featureCollection.features[0].properties
			};
		},
	})


});