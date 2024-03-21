/**
 * 코드에 사용된 인증키를 외부의 개발 및 운영에 사용하지마세요.
 */

var map;
var mapOptions = new vw.MapOptions(
    vw.BasemapType.GRAPHIC,
    "",
    vw.DensityType.FULL,
    vw.DensityType.BASIC,
    false,
    new vw.CameraPosition(
        new vw.CoordZ(127.1001854, 37.3904385, 13487),
        new vw.Direction(-90, 0, 0)
    ),
    new vw.CameraPosition(
        new vw.CoordZ(127.1001854, 37.3904385, 4800),
        new vw.Direction(0, -90, 0)
    )
);

map = new vw.Map("vmap", mapOptions);

//지도 초기화 후 실행
vw.ws3dInitCallBack = function() {
    var z;
    var test01 = function() {
        var viewRect = ws3d.viewer.scene.camera.computeViewRectangle();
        var _html = "";
        var West = ws3d.common.CesiumMath.toDegrees(viewRect.west).toFixed(7) //long min
        var South = ws3d.common.CesiumMath.toDegrees(viewRect.south).toFixed(7) //lan min
        var East = ws3d.common.CesiumMath.toDegrees(viewRect.east).toFixed(7) //long max
        var North = ws3d.common.CesiumMath.toDegrees(viewRect.north).toFixed(7) //lan max

        position = map.getCurrentPosition().position
        z = position.z
        console.log(z);

        //makeLine(West,South,East,North,z);
        // z 가 <10000 미만이면 구현

        _html = ` West:${West} 
                    South:${South}  
                    East:${East} 
                    North:${North} `;

        $("#cdata_code").html(_html);
    }
    vw.EventProcess.add( "test01", map.onMoveEnd, test01 );

    document.getElementById("mapToolBar").hidden = true;
    document.getElementById("naviRotate").hidden = true;
    document.getElementById("naviZoomPannel").hidden = true;

};

var callback = function(data) {
    console.log(data);
};
var resultAjax = false;
//cctv 목록 조회
var pointGroup;
var loadcctv = function(){
    var viewRect = ws3d.viewer.scene.camera.computeViewRectangle();
    var West = ws3d.common.CesiumMath.toDegrees(viewRect.west).toFixed(7) //long min
    var South = ws3d.common.CesiumMath.toDegrees(viewRect.south).toFixed(7) //lan min
    var East = ws3d.common.CesiumMath.toDegrees(viewRect.east).toFixed(7) //long max
    var North = ws3d.common.CesiumMath.toDegrees(viewRect.north).toFixed(7) //lan max

    var _html = "";
    var cctvUrl = `https://openapi.its.go.kr:9443/cctvInfo?type=all&cctvType=1&minX=${West}&maxX=${East}&minY=${South}&maxY=${North}&getType=json&apiKey=9d843f1f50324febab89fff4ce89c598`;
    //
    $.ajax({
        type : "get",
        url : cctvUrl,
        dataType : 'json',
        async : false,
        crossDomain: true,
        beforeSend:  function(){
            $("#wsLoadingIndicator").show();
            map.clear()
        },
        success : function(data) {

            if(data.response.datacount==0){
                return;
            }
            resultAjax = true;

            console.log(data);
            cctvformat = data.response.data[0].cctvformat;
            cctvname = data.response.data[0].cctvname;
            cctvurl = data.response.data[0].cctvurl;
            coordx = data.response.data[0].coordx;
            coordy = data.response.data[0].coordy;
            chtml =
                `<div class="map_layer" id="POP_CCTV_12045CTE11002_4287" style="left: 786px; top: 291px; z-index: 12;">
                    <button type="button" class="close" onclick="getCctv(${cctvurl});">click</button>
                    <div class="title_box"><span class="tit" onclick="getCctv(${cctvurl});" >CCTV</span><strong class="title">${cctvname}</strong></div>
                    <div class="contents_box" style="padding: 10px 5px 5px;border: 1px solid whitesmoke;">
                        <div class="tit_box">
                        <video id="video_12045CTE11002" width="286" height="260" controls="" style="object-fit: fill;">
                        </video>
                        </div>
                    </div>
                    <div class="put_box"><p>-</p></div>
                </div>`

            pointGroup = new vw.geom.ShapeGroups("testgroups");
            // 1. 이미지 일괄지정.
            pointGroup.setImage("https://map.vworld.kr/images/v2map/spotmarker.png");
            data.response.data.forEach(function(i,c){


                cctvformat = i.cctvformat;
                cctvname = i.cctvname;
                cctvurl = i.cctvurl;
                coordx = i.coordx;
                coordy = i.coordy;

                eval(`var pt${c} = new vw.geom.Point(new vw.Coord(${coordx},${coordy}))`);
                eval(`pt${c}.setId("${cctvurl}")`);
                eval(`pt${c}.setName("${cctvname}")`);
                eval(`pt${c}.setFont("고딕")`);
                eval(`pt${c}.setFontSize(10)`);
                eval(`pt${c}.create()`);
                eval(`pointGroup.add(pt${c})`);


            })



            $('#vidName').text(cctvname);

            var visbled = $('#anly_vid').is(":visible");
            if(!visbled){
                $('#anly_vid').show();
                getCctv(cctvurl);
            }

            //    var imgpath = location.protocol + '//' + location.hostname + ':' + location.port + '/assets/images/map/marker.png';
            // mapInit.map3d.createMarker(cctvname, coordx, coordy, chtml, imgpath, "300", "600");
        },
        complete: function(){
            $("#wsLoadingIndicator").hide()
            if(resultAjax){
                var eventHandler = function(windowPosition, ecefPosition, cartographic, featureInfo) {
                    //console.log("property :" , windowPosition, ecefPosition, cartographic, featureInfo);
                    if ( featureInfo != null ) {
                        // featureInfo 와 Point객체와는 다름.
                        // Point 객체를 가져올 경우 featureInfo.groupId로 가져옴.(그룹별 아이디라기 보다는 개별아이디.)
                        var id = featureInfo.groupId; //작명이..

                        getCctv(id);

                        $('#vidName').text(map.getObjectById(id).getName());
                    }
                }
                pointGroup.addEventListener(eventHandler);
                pointGroup.show();
            }
            resultAjax = false;
        },error : function(xhr, stat, err) {
            $("#wsLoadingIndicator").hide()

            console.log(stat + '; ' + err);

        }
    });
}

var hls = null;
//url 해당하는
var getCctv = function(url){
    var video = document.getElementById('video_target');
    if(Hls.isSupported()) {
        if(hls==null){

            hls = new Hls();
        }else{

        }
        hls.loadSource(url); // 동영상경로
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED,function() {
            video.play();
        });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {

        video.src = url; // 동영상경로

        video.addEventListener('canplay',function() {

            video.play();

        });

    }
}

// WMTS 적용을 위한 소스코드 시작

$(function(){
    $(document).on('click','[type=checkbox]',function(){

        this_val = $(this).attr("name");
        if($(this).attr("name")=="its_geo"){ //WMTS

            var layerUrl ="https://its.go.kr:9443/geoserver/gwc/service/wmts/rest/ntic:N_LEVEL_11/ntic:REALTIME/EPSG:3857/EPSG:3857:{z}/{y}/{x}?format=image/png";
            var layerName = "its_geo"
            if( $(this).is(":checked")){
                if(map.getLayerNmElement("its_geo")==null){
                    addWMTS_WebGL(layerName,layerUrl);
                }else{
                    map.getLayerNmElement("its_geo").show()
                }

            }else if( !$(this).is(":checked")){
                if(map.getLayerNmElement("its_geo")!=null){
                    map.getLayerNmElement("its_geo").hide()
                }
            }

        }
    });//'change'
})


var addWMTS_WebGL= function(layerName,layerUrl){
    var options = {
        name: layerName,
        numberOfLevelZeroTilesX : 1,
        numberOfLevelZeroTilesY : 1,
        url: layerUrl,
        hasAlphaChannel: true,  //true => (png포맷 영상타일인 경우-투명부위 처리원할때만 true)
        minimumLevel: 6,
        maximumLevel: 19
    }
    var wmts = new vw.source.WMTS( options );
}
// WMTS 적용을 위한 소스코드 종료
