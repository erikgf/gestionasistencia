var app = {},
   DT = null;

app.init = function(){
  //this.setDOM();
  this.setTemplates();
  this.setEventos();

  $("#tbodyresultados").html(this.tpl8.listado([]));
  this.obtenerDataBase();
};

app.setEventos  = function(){
  var self = this,
      btnBuscar = $("#btn-buscar"),
      btnGenerar = $("#btn-generar");

  btnBuscar.on("click", function(e){
    e.preventDefault();
    self.listar();
  });

  btnGenerar.on("click", function(e){
    e.preventDefault();
    self.generarExcel();
  });

  btnGenerar = null;
};

app.setTemplates = function(){
  var tpl8 = {};
  tpl8.listado = Handlebars.compile($("#tpl8Listado").html());
  tpl8.detalle = Handlebars.compile($("#tpl8Detalle").html());
  tpl8.combo = Handlebars.compile($("#tpl8Combo").html());

  this.tpl8 = tpl8;
};


app.obtenerDataBase =function(){
  var tpl8Combo = this.tpl8.combo,
      fn = function (xhr){
      if (xhr.rpt) {
        $("#cbopuntoacceso").html(tpl8Combo({opciones: xhr.data, rotulo: "Todos los puntos de acceso"}));
      }else{
        console.error(xhr.msj);
      }
  };

  new Ajxur.Api({
    modelo: "Asistencia",
    metodo: "obtenerDataBaseReporte"
  },fn);
};


app.exportar = function(fecha, fecha_raw, idpuntoacceso, puntoacceso){
  var strUrl;

    if (fecha_raw == ""){
      alert("Fecha no válida.");
      return;
    }

    if (idpuntoacceso == ""){
      alert("Punto de acceso no válido.");
      return;
    }

    strUrl = "../controlador/reportes.xls.asistencia.puntoacceso.php?p_f="+fecha_raw+"&p_ipa="+idpuntoacceso+"&p_pa="+puntoacceso; 
    window.open(strUrl,'_blank'); 
};

app.listar = function () {
  var self = this;
  var fn  =function(xhr){
    var datos = xhr.data;
    $("#tbodyresultados").html(self.tpl8.listado(datos));
    if (DT) { DT.fnDestroy(); DT = null; }
      $("#blk-detalle").empty();
  };

  new Ajxur.Api({
    metodo: "listarFechasPuntoAcceso",
    modelo: "Asistencia",
    data_out : [$("#txtfechainicio").val(), $("#txtfechafin").val(), $("#cbopuntoacceso").val()]
  }, fn);
};

app.verDetalle = function(fecha, fecha_raw, idpuntoacceso, puntoacceso){
  var self = this;
  var fn  =function(xhr){
    var datos = xhr.data,
        $blkDetalle = $("#blk-detalle");

      if (xhr.rpt) {
        if (DT) { DT.fnDestroy(); DT = null; }
        $blkDetalle.html(self.tpl8.detalle({registros: datos, fecha: fecha, idpuntoacceso: idpuntoacceso, puntoacceso: puntoacceso}));
        DT = $blkDetalle.find("table").dataTable({
          "aaSorting": [[0, "asc"]]
        });
      }else{
        console.error(datos.msj);
      }
  };

  new Ajxur.Api({
    metodo: "listarFechasPuntoAccesoDetalle",
    modelo: "Asistencia",
    data_out : [fecha_raw, idpuntoacceso]
  }, fn);
};  

$(document).ready(function(){
  app.init();
});

