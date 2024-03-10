function layers_kmlDownload(chkRaido){
	let layers = vmap.getLayers().getArray()
	layers.map(function (layer) {
		if (layer.get('type') === 'layers_kmlDownload') {
			vmap.removeLayer(layer)
		}
	})

	let layerName = chkRaido.value;
	let layerText = chkRaido.parentNode.querySelector('label').textContent;


	let layer_tile = new ol.layer.Tile({
		id: layerName,
		name: layerText,
		type: 'layers_kmlDownload',
		extent: vmap.getView().getProjection().getExtent(),
		maxZoom: 18,
		minZoom: 10,
		tilePixelRatio: 1,
		tileSize: [512, 512],
		source: new ol.source.TileWMS({
			url: "https://api.vworld.kr/req/wms?",
			params: {
				layers: layerName.toLowerCase(),
				styles: layerName.toLowerCase(),
				apikey: apikey,
				title: layerName,
				FORMAT: "image/png",
				WIDTH:512,
				HEIGHT:512
			}
		})
	});
	layer_tile.setZIndex(5);
	vmap.addLayer(layer_tile);
	setTimeout(function () {
		_kmlDownload()
	}, 700)
}


vmap.on('moveend', function () {
	_kmlDownload()
})

function _kmlDownload(){
	if (selectContent !== 'kmlDownload'){ return false; }

	let bbox = vmap.getCoordinateFromPixel([0,0])[0] + "," + vmap.getCoordinateFromPixel(vmap.getSize())[1] + "," + vmap.getCoordinateFromPixel(vmap.getSize())[0] +"," + vmap.getCoordinateFromPixel([0,0])[1]
	let layerName;
	try{
		layerName = $('input[name="layers_kmlDownload"]:checked').val();
	}catch (e) {
		layerName = "none";
	}

	if (layerName !== "none") {
		$.ajax({
			type: 'get',
			url: 'https://api.vworld.kr/req/data',
			data: {
				key: apikey,
				service: 'data',
				version: '2.0',
				request: 'GetFeature',
				format: 'json',
				size: '1000',
				page: '1',
				data: layerName,
				geometry: 'true',
				attribute: 'true',
				crs: vmap.getView().getProjection().getCode(),
				geomFilter: 'BOX(' + bbox + ')'
			},
			dataType: 'jsonp',
			async: false,
			success: function (data){

				if (data.response.result?.featureCollection) {
					var vectorSource = new ol.source.Vector({features: (new ol.format.GeoJSON()).readFeatures(data.response.result.featureCollection)})

					let layers = vmap.getLayers().getArray()
					layers.map(function (layer) {
						if (layer.get('name') === 'kmlDownloadPreView') {
							vmap.removeLayer(layer)
						}
					})
					var vector_layer = new ol.layer.Vector({
						name: "kmlDownloadPreView",
						type: "kmlDownloadPreView",
						source: vectorSource,
						style: function (feature) {
							var style = new ol.style.Style({
								stroke: new ol.style.Stroke({
									color: [0, 256, 0, 1],
									width: 5
								}),
								fill: new ol.style.Fill({
									color: [256, 0, 0, .7]
								}),
								circle: new ol.style.Circle({
									radius: 2,
									fill: new ol.style.Fill({
										color: [0, 256, 0, 1]
									})
								})
							});
							return [style];
						}
					})

					vector_layer.set("name", "kmlDownloadPreView");
					vmap.addLayer(vector_layer);

					var features = (new ol.format.GeoJSON()).readFeatures(data.response.result.featureCollection);
					// console.log(features)
					string = new ol.format.KML().writeFeatures(features, {
						featureProjection: vmap.getView().getProjection()
					});

					if (layerName !== "none") {
						var uri = 'data:application/kml;charset=UTF-8,' + encodeURIComponent(string);
						$('#btn_kmlDownload').attr("href", uri);
						$('#btn_kmlDownload').attr("downlaod", layerName + ".kml");
					}else{
						$('#btn_kmlDownload').removeAttr("href");
					}
				}
			}
		})
	}
}

document.getElementById('btn_kmlDownload').addEventListener('click', function () {
	let layerName = $('input[name="layers_kmlDownload"]:checked').val();
	if (layerName !== "none") {
		let uri = $(this).attr('data-href')
		let download = $(this).attr('data-download')
		$(this).attr('href', uri)
		$(this).attr('download', download)
	}else{
		$('#btn_kmlDownload').removeAttr("href");
	}
});
