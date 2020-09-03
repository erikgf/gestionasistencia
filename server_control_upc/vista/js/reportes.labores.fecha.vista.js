var app = {},
   DT = null;

app.init = function(){
  //this.setDOM();
  this.setTemplates();
  this.setEventos();

  $("#tbodyresultados").html(this.tpl8.listado([]));
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

  this.tpl8 = tpl8;
};

app.exportar = function(fundo, fecha_raw){
  var strUrl;

    if (fecha_raw == ""){
      alert("Fecha no válida.");
      return;
    }

    var fI = $("#txtfechainicio").val(), fF = $("#txtfechafin").val();

    strUrl = "../controlador/reportes.xls.labores.fechas.php?p_f="+fecha_raw+"&p_fi="+fI+"&p_ff="+fF+"&p_fun="+fundo; 
    window.open(strUrl,'_blank'); 
};

app.exportarHE = function(fundo, fecha_raw){
  var strUrl;

    if (fecha_raw == ""){
      alert("Fecha no válida.");
      return;
    }

    var fI = $("#txtfechainicio").val(), fF = $("#txtfechafin").val();

    strUrl = "../controlador/reportes.xls.labores.horasextra.fechas.php?p_f="+fecha_raw+"&p_fi="+fI+"&p_ff="+fF+"&p_fun="+fundo; 
    window.open(strUrl,'_blank'); 
};

app.listar = function () {
  var self = this;
  var fn  =function(xhr){
    var datos = xhr.data;
    datos.unshift({fecha:"Todo el RANGO",fecha_raw: "*"});
    $("#tbodyresultados").html(self.tpl8.listado(datos));
  };

  new Ajxur.Api({
    metodo: "listarFechas",
    modelo: "ControlLabor",
    data_out : [$("#txtfechainicio").val(), $("#txtfechafin").val()]
  }, fn);
};

$(document).ready(function(){
  app.init();
});

