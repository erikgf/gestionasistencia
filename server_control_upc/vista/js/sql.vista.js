var app = {};

app.init = function(){
  //this.setDOM();
  this.setEventos();
};

app.setEventos  = function(){
  var self = this,
      btnEjecutar = $("#btn-ejecutar");

  btnEjecutar.on("click", function(e){
    e.preventDefault();
    self.ejecutarSQL();
  });

  btnGenerar = null;
};

/*
app.ejecutarSQL = function(){
  var $sql = $("#txtsql").val(),
      $res = $("#txtresultados").val(),
      strUrl;

    strUrl = "../controlador/reportes.xls.formularios.evaluacion.php?"+
                    "p_fi="+$fi+"&"+
                    "p_ff="+$ff; 
UPDATE registros_detalle SET dia_tallos_infestados = 3  WHERE cod_registro_detalle= 4;
    window.open(strUrl,'_blank'); 
};
*/

var imprimirTablaResultados = function (dataArreglo) {
  var esArreglo = false;
  if(Array.isArray(dataArreglo) && dataArreglo.length){
    esArreglo = true;
  }

  var objUno =dataArreglo[0],
      keys =Object.keys(objUno),
      fnKeys = function(_keys){
        var html = "";
         $.each(_keys, function(i,o){
          html += "<th>"+o+"</th>";
        });
        return html;
      },
      fnRegistro = function(_reg){
        var html = "";
         $.each(_reg, function(i,o){
          html += "<td>"+o+"</td>";
        });
        return html;
      },
      htmlCabecera  = "<thead><tr>"+fnKeys(keys)+"</tr></thead>";

  console.log(keys);

  if (keys.length <= 0){
     return "<b>CONSULTA REALIZADA CORRECTAMENTE.</b>";
  }

  var htmlBody = "";

  for (var i = 0, len = dataArreglo.length;  i < len; i++) {
    htmlBody += "<tr>";
    htmlBody += fnRegistro(dataArreglo[i]);
    htmlBody += "</tr>";
  };


  return "<table class='table table-bordered'>"+htmlCabecera+htmlBody+"</table>";
};

app.ejecutarSQL = function () {  
  var sql = $("#txtsql").val(),
      fn  =function(xhr){
        var $res = $("#txtresultados"),
            datos = xhr;
        if (datos.rpt){
          $res.html(imprimirTablaResultados(datos.data));
        } else {
          $res.html("<p style='color:red'>"+datos.msj+"</p>");
        }
      },
      fnError = function(error){
        console.error(error);
      };

  new Ajxur.Api({
    metodo: "consultaSQL",
    modelo: "Executor",
    data_out : [sql]
  }, fn, fnError);
};

$(document).ready(function(){
  app.init();
});

