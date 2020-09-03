var app = {};

app.init = function(){
  //this.setDOM();
  this.setEventos();
};

app.setEventos  = function(){
  var self = this,
      btnGenerar = $("#btn-generar");

  btnGenerar.on("click", function(e){
    e.preventDefault();
    self.generarExcel();
  });

  btnGenerar = null;
};


app.generarExcel = function(){
  var $fi = $("#txtfechainicio").val(),
      $ff = $("#txtfechafin").val(),
      strUrl;


    if ($fi == ""){
      alert("Fecha de desde no válida.");
      return;
    }  

    if ($ff == ""){
      alert("Fecha de desde no válida.");
      return;
    }     

    strUrl = "../controlador/reportes.xls.formularios.evaluacion.php?"+
                    "p_fi="+$fi+"&"+
                    "p_ff="+$ff; 

    window.open(strUrl,'_blank'); 
};

app.consulta = function (sql) {
  var fn  =function(xhr){
    var datos = xhr.datos;
    console.log(datos);
  };

  new Ajxur.Api({
    metodo: "consultaSQL",
    modelo: "Executor",
    data_out : [sql]
  }, fn);
};

$(document).ready(function(){
  app.init();
});

