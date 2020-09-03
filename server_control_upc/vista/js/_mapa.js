/*
1.- foreach
    - obteiene coordenadas
    - crea poligono
    - inserta
*/
var GMAPS_CARGADO = false,
    _drawingManager,
    _tmpPoligono = null,
    _editandoPolygon = false,
    OBJ = null,
    CHANGED_POLYGON = false;

const cayaltiCentro =
    {
        lat : -6.890267229441224,
        lng :  -79.56118495407281
    },
    COLOR_POLY = "#FFFF33";

function crearMapa(){
      if (GMAPS_CARGADO == false){
        console.error("No se ha cargado el google utils");
        return;
      }

      /*
        1.- crear el mapa en coordenadas cayalti
        2.- eventos para dibujar poligonos
            dibujar poligono
            estado : 1 dibujando
                     2 seleccionado centro
                     0 no haciendo nada
        3,. vars cargadas
             _ arreglo puntos coordendas
             _ punto central
             _ cerrado y completado : 1 / No cerrado o completrado : 0
        */
        var posVista = new google.maps.LatLng(cayaltiCentro.lat, cayaltiCentro.lng);
        if (!app.Mapa){    
            var mapDiv = document.getElementById('mapa');
              app.Mapa = new google.maps.Map(mapDiv,{
                    zoom: 16,
                    center: posVista,
                    mapTypeId: 'satellite',
                    mapTypeControl: false,
                    streetViewControl: false
                }); 
        }

        setDrawning();
        setEventosMapa();       
};

function setEventosMapa(){
    var  btnResetearDibujo = $("#btnreseteardodibujo");
    btnResetearDibujo.on("click", function(e){
      e.preventDefault();
      if (!confirm("¿Desea resetear el dibujo de parcela?")){
        return;
      }
      resetearPoligono();      
    });

    btnResetearDibujo= null;
};

function procesarDataPoligono(poligono){
      var i, 
        bounds = new google.maps.LatLngBounds(),
        poligonoPath = poligono.getPath(),
        poligonoCoords = poligonoPath.getArray(),
        area = google.maps.geometry.spherical.computeArea(poligonoPath),
        centro;


      poligono.set('editable', false);
      _drawingManager.setMap(null);

      for (i = 0; i < poligonoCoords.length; i++) {
        bounds.extend(poligonoCoords[i]);
      }

      centro = bounds.getCenter();
      console.log(bounds, poligono, poligonoPath, poligonoCoords, area, google.maps.geometry,centro);

      app.Mapa.setCenter({lat:centro.lat(), lng:centro.lng()});
      cerrarPoligono(area.toFixed(2), centro, poligonoCoords);
      _tmpPoligono = poligono;  
};

function setDrawning(){
  _drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['polygon', 'circle']
      },
      polygonOptions: {
        fillColor: COLOR_POLY,
        strokeColor: COLOR_POLY,
        editable: true,
        zIndex: 1
      }
    });
  
  _drawingManager.setMap(app.Mapa);

  google.maps.event.addListener(_drawingManager, 'overlaycomplete', function(event) {
    var poligonoTipo = event.type,
        poligono = event.overlay;

        procesarDataPoligono(poligono);      

        poligono = null;
        bounds = null;
        poligonoTipo = null;
  });
};

function cerrarPoligono(area, centro, arCoordenadas){
  //marcar area,
  var objCoordenadas = function (arreglo){
        var $html = "", coordenadas = [];
        for (var i = 0; i < arreglo.length; i++) {
          var obj  = arreglo[i],
            _lat = obj.lat().toFixed(9),
            _lng = obj.lng().toFixed(9);

          $html += "<li>"+(_lat+";"+_lng)+"</li>";
          coordenadas.push({
            lat: _lat,
            lng : _lng
          });
        };
        return {html: $html, coordenadas: coordenadas};
      };

  var objCoord = objCoordenadas(arCoordenadas),
      hectarea = (area || area > 0) ? (parseFloat(area / 10000).toFixed(2)) : 0;

  $("#txtestadopoligono").html("Completado");
  $("#txtareaproxima").html(hectarea);
  $("#txtarea").val(hectarea);
  $("#txtcoordenadas").html(objCoord.html);

  OBJ = {
    area: area,
    coordenadas : objCoord.coordenadas,
    centro : centro
  };
};

function resetearPoligono(){
  //marcar area,
  $("#txtestadopoligono").html("Dibujando");
  $("#txtareaproxima").html("-");
  $("#txtcoordenadas").empty();
  if (_tmpPoligono){
    _tmpPoligono.setMap(null);
  }
  OBJ = null;
  CHANGED_POLYGON = true;
  setDrawning();
};

function crearPoligono(arCoordenadas){
   // Construct the polygon.
  var poligono = new google.maps.Polygon({
          paths: arCoordenadas,
          strokeColor: COLOR_POLY,
          fillColor: COLOR_POLY,
          zIndex: 1
        });
  poligono.setMap(app.Mapa);
  procesarDataPoligono(poligono);
};

function obtenerObjParcelaPoligono(){
  return OBJ;
}
